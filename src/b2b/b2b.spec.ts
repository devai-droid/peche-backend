import { ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { buildB2bMemoLine, normalizeKoreanMobile } from "@root/b2b/b2b.util"
import { B2bService } from "@root/b2b/service/b2b.service"
import { RolesGuard } from "@root/shared/security/roles.guard"
import { Role } from "@root/shared/enum/auth"

describe("b2b.util", () => {
  it("휴대폰 번호를 +82 형식으로 정규화", () => {
    expect(normalizeKoreanMobile("010-1234-5678")).toBe("+821012345678")
    expect(normalizeKoreanMobile("+82 10 1234 5678")).toBe("+821012345678")
    expect(normalizeKoreanMobile("02-123-4567")).toBeNull()
    expect(normalizeKoreanMobile("")).toBeNull()
  })

  it("닥팔 메모 회사 줄", () => {
    expect(buildB2bMemoLine({ companyName: "삼성전자", discountRate: 10, discountNote: "제모 제외" })).toBe(
      "[B2B 협약] 삼성전자 · 협약할인 10% · 제모 제외",
    )
    expect(buildB2bMemoLine({ companyName: "LG", discountRate: null })).toBe("[B2B 협약] LG")
  })
})

describe("RolesGuard", () => {
  const ctx = (roles: Role[] | undefined, user: object | undefined) =>
    ({
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      _roles: roles,
    } as any)
  const guardWith = (required?: Role[]) => new RolesGuard({ getAllAndOverride: () => required } as unknown as Reflector)

  it("ADMIN 필요 API는 ADMIN 역할만 통과", () => {
    expect(guardWith([Role.ADMIN]).canActivate(ctx(undefined, { roles: [Role.USER] }))).toBe(false)
    expect(guardWith([Role.ADMIN]).canActivate(ctx(undefined, { roles: [] }))).toBe(false)
    expect(guardWith([Role.ADMIN]).canActivate(ctx(undefined, { roles: [Role.ADMIN] }))).toBe(true)
  })
  it("USER API는 로그인만 되어 있으면 통과(역할 비어있는 기존 회원 포함)", () => {
    expect(guardWith([Role.USER]).canActivate(ctx(undefined, { roles: [] }))).toBe(true)
    expect(guardWith([Role.USER]).canActivate(ctx(undefined, undefined))).toBe(false)
  })
  it("역할 지정이 없으면 통과", () => {
    expect(guardWith(undefined).canActivate(ctx(undefined, undefined))).toBe(true)
  })
})

describe("B2bService.createReservation", () => {
  const company = { id: "c1", name: "삼성전자", discountRate: 10, discountNote: null, isActive: true }
  const raw = { id: "v1", company_id: "c1", email: "a@samsung.com", name: "홍길동", phone: "+821012345678" }

  const setup = (claimedRows: object[], createImpl?: () => Promise<unknown>) => {
    const execute = jest.fn().mockResolvedValue({ raw: claimedRows })
    const qb: any = {}
    ;["update", "set", "where", "returning"].forEach((m) => (qb[m] = jest.fn().mockReturnValue(qb)))
    qb.execute = execute
    const verificationRepository: any = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      update: jest.fn().mockResolvedValue(undefined),
    }
    const companyRepository: any = { findOne: jest.fn().mockResolvedValue(company) }
    const reservationService: any = {
      stripAdminFields: jest.fn((dto) => dto),
      create: jest.fn(createImpl ?? (() => Promise.resolve({ id: "r1" }))),
    }
    const service = new B2bService(
      companyRepository,
      verificationRepository,
      {} as any,
      {} as any,
      {} as any,
      reservationService,
    )
    return { service, verificationRepository, reservationService }
  }
  const user = { id: "u1", b2bVerificationId: "v1", roles: [Role.USER] }
  const dto: any = { datetime: new Date(), productIds: ["p1"] }

  it("인증 토큰이 아니면 거부", async () => {
    const { service } = setup([raw])
    await expect(service.createReservation(dto, { id: "u1" })).rejects.toBeInstanceOf(ForbiddenException)
  })

  it("이미 쓴/만료된 인증이면 거부", async () => {
    const { service, reservationService } = setup([])
    await expect(service.createReservation(dto, user)).rejects.toBeInstanceOf(ForbiddenException)
    expect(reservationService.create).not.toHaveBeenCalled()
  })

  it("정상: 직원 입력값과 회사 정보를 예약에 전달", async () => {
    const { service, reservationService } = setup([raw])
    await service.createReservation(dto, user)
    expect(reservationService.create).toHaveBeenCalledWith(
      dto,
      user,
      expect.objectContaining({ companyName: "삼성전자", discountRate: 10, name: "홍길동", phone: "+821012345678" }),
    )
  })

  it("예약 실패 시 인증을 되돌려 재시도 가능", async () => {
    const { service, verificationRepository } = setup([raw], () => Promise.reject(new Error("slot taken")))
    await expect(service.createReservation(dto, user)).rejects.toThrow("slot taken")
    expect(verificationRepository.update).toHaveBeenCalledWith({ id: "v1" }, { usedAt: null })
  })
})
