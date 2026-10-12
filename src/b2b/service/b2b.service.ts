import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as dayjs from "dayjs"
import { B2bCompany } from "@root/b2b/entities/b2b-company.entity"
import { B2bVerification } from "@root/b2b/entities/b2b-verification.entity"
import { B2bReservation } from "@root/b2b/entities/b2b-reservation.entity"
import { B2bSetting, B2B_SETTING_RESERVATION_NOTICE } from "@root/b2b/entities/b2b-setting.entity"
import {
  B2bRequestCodeDto,
  B2bReservationList,
  B2bReservationQueryDto,
  B2bVerifyDto,
  B2bNoticeDto,
  B2bVerifyResponse,
  CreateB2bCompanyDto,
  UpdateB2bCompanyDto,
} from "@root/b2b/dto/b2b.dto"
import { normalizeKoreanMobile } from "@root/b2b/b2b.util"
import { AuthService } from "@root/auth/service/auth.service"
import { ReservationService } from "@root/reservation/service/reservation.service"
import { CreateReservationDto } from "@root/reservation/dto/reservation.dto"
import { User } from "@root/shared/interface/user"

const B2B_VERIFICATION_TTL_MINUTES = 30

@Injectable()
export class B2bService {
  constructor(
    @InjectRepository(B2bCompany) private readonly companyRepository: Repository<B2bCompany>,
    @InjectRepository(B2bVerification) private readonly verificationRepository: Repository<B2bVerification>,
    @InjectRepository(B2bReservation) private readonly reservationRepository: Repository<B2bReservation>,
    @InjectRepository(B2bSetting) private readonly settingRepository: Repository<B2bSetting>,
    private readonly authService: AuthService,
    private readonly reservationService: ReservationService,
  ) {}

  // ── 직원 인증 ──────────────────────────────

  /** 1단계: 협약사 도메인 확인 후 회사 이메일로 인증번호 발송 */
  async requestCode(dto: B2bRequestCodeDto, ip: string) {
    const email = this.normalizeEmail(dto.email)
    this.requirePhone(dto.phone)
    await this.requireCompanyByEmail(email)
    await this.authService.createAuthCodeByEmail({ email }, ip)
    return { sent: true }
  }

  /** 2단계: 인증번호 확인 → 예약 1건용 토큰(30분) 발급 */
  async verify(dto: B2bVerifyDto): Promise<B2bVerifyResponse> {
    const email = this.normalizeEmail(dto.email)
    const phone = this.requirePhone(dto.phone)
    const name = dto.name.trim()
    const company = await this.requireCompanyByEmail(email)

    const authCode = await this.authService.findValidAuthCode({ email }, dto.code.trim())
    if (!authCode) {
      throw new UnauthorizedException("인증번호가 올바르지 않거나 만료되었습니다. 다시 요청해 주세요.")
    }
    await this.authService.discardAuthCode(authCode)

    const user = await this.authService.findOrCreateUserByEmail(email, name)
    const expiresAt = dayjs().add(B2B_VERIFICATION_TTL_MINUTES, "minute").toDate()
    const verification = await this.verificationRepository.save({
      companyId: company.id,
      userId: user.id,
      email,
      name,
      phone,
      expiresAt,
    })
    const token = this.authService.signShortLivedToken(
      user,
      { b2bVerificationId: verification.id },
      `${B2B_VERIFICATION_TTL_MINUTES}m`,
    )
    return { token, expiresAt, companyName: company.name, name }
  }

  // ── 예약 ──────────────────────────────────

  /** 인증 1건을 소모해 예약 1건 생성. 예약이 실패하면 인증을 되돌려 같은 인증으로 다시 시도할 수 있다. */
  async createReservation(dto: CreateReservationDto, user: User) {
    if (!user?.b2bVerificationId) {
      throw new ForbiddenException("회사 이메일 인증이 필요합니다.")
    }
    const claimed = await this.verificationRepository
      .createQueryBuilder()
      .update(B2bVerification)
      .set({ usedAt: () => "now()" })
      .where("id = :id AND user_id = :userId AND used_at IS NULL AND expires_at > now()", {
        id: user.b2bVerificationId,
        userId: user.id,
      })
      .returning("*")
      .execute()
    const raw = claimed.raw?.[0]
    if (!raw) {
      throw new ForbiddenException("인증이 만료되었거나 이미 사용되었습니다. 회사 이메일 인증을 다시 진행해 주세요.")
    }

    try {
      const company = await this.companyRepository.findOne({ where: { id: raw.company_id } })
      if (!company || !this.isContractActive(company)) {
        throw new ForbiddenException("협약이 종료된 회사입니다.")
      }
      return await this.reservationService.create(this.reservationService.stripAdminFields(dto, user), user, {
        companyId: company.id,
        companyName: company.name,
        discountRate: company.discountRate,
        discountNote: company.discountNote,
        verificationId: raw.id,
        email: raw.email,
        name: raw.name,
        phone: raw.phone,
      })
    } catch (e) {
      await this.verificationRepository.update({ id: raw.id }, { usedAt: null })
      throw e
    }
  }

  // ── 협약사 관리(어드민) ────────────────────

  async findCompanies() {
    return this.companyRepository.find({ order: { isActive: "DESC", name: "ASC" } })
  }

  async createCompany(dto: CreateB2bCompanyDto, user?: User) {
    const emailDomains = this.normalizeDomains(dto.emailDomains)
    await this.assertDomainsFree(emailDomains)
    return this.companyRepository.save(
      Object.assign(new B2bCompany(), dto, { emailDomains, isActive: dto.isActive ?? true, createdBy: user?.id }),
    )
  }

  async updateCompany(id: string, dto: UpdateB2bCompanyDto, user?: User) {
    const company = await this.companyRepository.findOne({ where: { id } })
    if (!company) throw new NotFoundException()
    const patch: Partial<B2bCompany> = { ...dto, updatedBy: user?.id }
    if (dto.emailDomains) {
      patch.emailDomains = this.normalizeDomains(dto.emailDomains)
      await this.assertDomainsFree(patch.emailDomains, id)
    }
    return this.companyRepository.save(Object.assign(company, patch))
  }

  /** B2B 예약 이력: 회사 이메일(소유주)별로 언제 어떤 시술을 예약했는지 */
  async findReservations(query: B2bReservationQueryDto): Promise<B2bReservationList> {
    const page = query.page ?? 1
    const limit = query.limit ?? 50
    const qb = this.reservationRepository.createQueryBuilder("r").orderBy("r.created_at", "DESC")
    if (query.companyId) qb.andWhere("r.company_id = :companyId", { companyId: query.companyId })
    if (query.email) qb.andWhere("r.email ILIKE :email", { email: `%${query.email.trim()}%` })
    if (query.from)
      qb.andWhere("r.created_at >= CAST(CAST(:from AS date) AS timestamp) AT TIME ZONE 'Asia/Seoul'", {
        from: query.from,
      })
    if (query.to) {
      qb.andWhere("r.created_at < CAST(CAST(:to AS date) + 1 AS timestamp) AT TIME ZONE 'Asia/Seoul'", { to: query.to })
    }
    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const reservations = await this.reservationService.findManyByIds(rows.map((r) => r.reservationId))
    const byId = new Map(reservations.map((r) => [r.id, r]))
    const items = rows.map((r) => {
      const reservation = byId.get(r.reservationId)
      return {
        ...r,
        datetime: reservation?.datetime,
        status: reservation?.status,
        items: [...(reservation?.eventSnapshot ?? []), ...(reservation?.productSnapshot ?? [])],
      }
    })
    return { items, total, page, limit }
  }

  // ── 사이트 안내 문구 ──────────────────────

  async getNotice(): Promise<B2bNoticeDto> {
    const row = await this.settingRepository.findOne({ where: { key: B2B_SETTING_RESERVATION_NOTICE } })
    return { reservationNotice: row?.value ?? null }
  }

  async updateNotice(dto: B2bNoticeDto, user?: User): Promise<B2bNoticeDto> {
    const value = dto.reservationNotice?.trim() || null
    await this.settingRepository.save({ key: B2B_SETTING_RESERVATION_NOTICE, value, updatedBy: user?.id })
    return { reservationNotice: value }
  }

  // ── 내부 ──────────────────────────────────

  private normalizeEmail(email: string) {
    return (email ?? "").trim().toLowerCase()
  }

  private requirePhone(raw: string) {
    const phone = normalizeKoreanMobile(raw)
    if (!phone) throw new BadRequestException("휴대폰 번호를 정확히 입력해 주세요.")
    return phone
  }

  private normalizeDomains(domains: string[]) {
    const normalized = (domains ?? [])
      .map((d) => d.trim().toLowerCase().replace(/^.*@/, ""))
      .filter((d) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d))
    if (normalized.length === 0) throw new BadRequestException("회사 이메일 도메인을 1개 이상 입력해 주세요.")
    return Array.from(new Set(normalized))
  }

  /** 같은 도메인이 두 회사에 등록되면 어느 회사 직원인지 모호해지므로 막는다 */
  private async assertDomainsFree(domains: string[], exceptId?: string) {
    const qb = this.companyRepository.createQueryBuilder("c").where("c.email_domains && :domains", { domains })
    if (exceptId) qb.andWhere("c.id <> :exceptId", { exceptId })
    const dup = await qb.getOne()
    if (dup) throw new BadRequestException(`이미 '${dup.name}'에 등록된 도메인이 있습니다.`)
  }

  private async requireCompanyByEmail(email: string) {
    const domain = email.split("@")[1]
    const company = domain
      ? await this.companyRepository
          .createQueryBuilder("c")
          .where(":domain = ANY(c.email_domains)", { domain })
          .andWhere("c.is_active = true")
          .getOne()
      : null
    if (!company || !this.isContractActive(company)) {
      throw new BadRequestException("협약된 회사 이메일이 아닙니다. 회사 이메일 주소를 확인해 주세요.")
    }
    return company
  }

  /** 계약기간(KST 날짜, 양 끝 포함) 안이고 활성 상태인지 */
  private isContractActive(company: B2bCompany) {
    if (!company.isActive) return false
    const today = dayjs().add(9, "hour").format("YYYY-MM-DD")
    if (company.contractStart && today < company.contractStart) return false
    if (company.contractEnd && today > company.contractEnd) return false
    return true
  }
}
