import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"

import { UserStatus } from "@root/shared/enum/user"
import { AuthTokenResponse, SignUpDto } from "../dto/auth-sign-up.dto"
import {
  AuthFactor,
  AuthSignInDto,
  CodeAuthByEmailDto,
  CodeAuthByPhoneDto,
  CreateEmailCodeDto,
  CreatePhoneCodeDto,
  SocialAuthDto,
} from "../dto/auth-sign-in.dto"
import { UserService } from "../../users/service/user.service"
import { AuthProvider, LanguageLocale, Role } from "../../shared/enum/auth"
import { AccountUser } from "../../users/entities/user.entity"
import {
  ADMIN_PHONE_NUMBER,
  DEFAULT_VERIFICATION_CODE_DIGIT,
  JWT_EXPIRED_IN_30_DAYS,
  JWT_ISSUER,
  SIXTY_SECONDS,
} from "../../shared/constant/auth"
import { JwtPayload, SocialAuthPayload } from "../../shared/interface/auth"
import { ROLES_KEY } from "../../shared/decorator/auth-user.decorator"
import { PasswordChangeDto } from "../dto/password.dto"
import { KakaoRepository } from "@root/auth/repository/kakao.repository"
import { CreateUserDto, UserDto } from "@root/users/dto/user.dto"
import { DataSource, Repository } from "typeorm"
import { randomXDigit } from "@root/shared/utils"
import { InjectRepository } from "@nestjs/typeorm"
import { SmsService } from "@root/message/service/sms.service"
import { I18nContext, I18nService } from "nestjs-i18n"
import { AuthCode } from "@root/auth/entities/auth-code.entity"
import { SesService } from "@root/message/service/ses.service"

@Injectable()
export class AuthService {
  constructor(
    private readonly datasource: DataSource,
    private readonly jwtService: JwtService,
    private readonly kakaoRepository: KakaoRepository,
    private readonly i18n: I18nService,
    @InjectRepository(AuthCode) private authRepository: Repository<AuthCode>,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => SmsService)) private readonly smsService: SmsService,
    @Inject(forwardRef(() => SesService)) private readonly sesService: SesService,
  ) {}

  async authenticateByKakao(dto: SocialAuthDto) {
    const payload = await this.kakaoRepository.getVerifiedIdTokenPayload(dto.idToken)
    return await this.authenticateBySocial(payload)
  }

  async createAuthCodeByPhone(dto: CreatePhoneCodeDto, ip: string) {
    const code = await this.createAuthCode({ phoneNumber: dto.phoneNumber }, ip)
    await this.smsService.sendVerificationCodeSms(dto.phoneNumber, code.code)
  }

  async createAuthCodeByEmail(dto: CreateEmailCodeDto, ip: string) {
    const code = await this.createAuthCode({ email: dto.email }, ip)
    await this.sesService.sendVerificationEmail(dto.email, code.code)
  }

  async authenticateByPhone(dto: CodeAuthByPhoneDto) {
    const auth = await this.findAuthCodeByPhoneNumber(dto.phoneNumber, dto.code)
    return await this.authenticateByCode(auth, dto.name)
  }

  async authenticateByEmail(dto: CodeAuthByEmailDto) {
    const auth = await this.findAuthCodeByEmail(dto.email, dto.code)
    return await this.authenticateByCode(auth, dto.name)
  }

  async signIn(dto: AuthSignInDto) {
    const user = await this.userService.findByEmail(dto.email)
    if (!user || user.status == UserStatus.INACTIVE) {
      throw new UnauthorizedException(this.i18n.t("MESSAGES.ERROR.UNAUTHORIZED", { lang: I18nContext.current().lang }))
    }
    if (!user.password) {
      throw new ForbiddenException()
    }
    const isCorrectPassword = await bcrypt.compare(dto.password, user.password)
    if (!isCorrectPassword) {
      throw new UnauthorizedException(this.i18n.t("MESSAGES.ERROR.UNAUTHORIZED", { lang: I18nContext.current().lang }))
    }
    return await this.getSignedToken(user)
  }

  async getSignedToken(user: AccountUser): Promise<string> {
    return this.jwtService.sign(
      { id: user.id, email: user.email, phoneNumber: user.phoneNumber, [ROLES_KEY]: user.roles },
      { expiresIn: JWT_EXPIRED_IN_30_DAYS, issuer: JWT_ISSUER },
    )
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.userService.findOne(payload.id)
    if (!user || user.status == UserStatus.INACTIVE) {
      throw new UnauthorizedException(this.i18n.t("MESSAGES.ERROR.UNAUTHORIZED", { lang: I18nContext.current().lang }))
    }
  }

  async changePassword(dto: PasswordChangeDto, userId: string) {
    const user = await this.userService.findOne(userId)
    if (!(await this.userService.checkIsCorrectPassword(user, dto.oldPassword))) {
      throw new UnauthorizedException(this.i18n.t("MESSAGES.ERROR.UNAUTHORIZED", { lang: I18nContext.current().lang }))
    }
    return await this.userService.updatePassword(user.id, dto.newPassword)
  }

  async getAdminToken() {
    const admin = await this.getAdminUser()
    return await this.getSignedToken(admin)
  }

  async getUserToken(userId: string) {
    const user = await this.userService.findOne(userId)
    return await this.getSignedToken(user)
  }

  async signUp(dto: SignUpDto) {
    const user = await this.createUser(dto)
    return await this.getSignedToken(user)
  }

  private async getAdminUser() {
    const admin = await this.findOneUserOrNull(ADMIN_PHONE_NUMBER)
    return admin ?? (await this.createAdmin())
  }

  private async findOneUserOrNull(phone: string) {
    return await this.datasource.manager.findOneBy(AccountUser, { phoneNumber: phone })
  }

  private async createAdmin() {
    const user = await this.userService.create(<CreateUserDto>{
      phoneNumber: ADMIN_PHONE_NUMBER,
      name: "관리자",
      languageLocale: LanguageLocale.ko,
    })
    return await this.userService.updateAdmin(user.id)
  }

  private async createUser(dto: SignUpDto, userStatus = UserStatus.VERIFIED) {
    return await this.userService.create(
      Object.assign({}, dto, <UserDto>{
        roles: [Role.USER],
        name: dto.name,
        status: userStatus,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        ...(dto.provider && { provider: dto.provider }),
        ...(dto.providerSub && { providerSub: dto.providerSub }),
      }),
    )
  }

  private async authenticateBySocial(payload: SocialAuthPayload) {
    if (await this.userService.isExistByProviderSub(payload.sub)) {
      const token = await this.getSignedToken(await this.userService.findByProviderSub(payload.sub))
      return new AuthTokenResponse(token, false)
    } else {
      if (payload.provider == AuthProvider.KAKAO) {
        const kakaoUser = await this.kakaoRepository.usersMe(payload.sub)
        const phoneNumber = this.kakaoRepository.getPhoneNumber(kakaoUser)
        if (await this.userService.isExistByPhoneNumber(phoneNumber)) {
          const user = await this.userService.findOneByPhoneNumber(phoneNumber)
          return new AuthTokenResponse(await this.getSignedToken(user), false)
        }
        const lang = I18nContext.current()?.lang ?? "ko"
        const normalizedLang = lang === "zh-TW" ? "zhTW" : (lang as keyof typeof LanguageLocale)

        const token = await this.signUp(<SignUpDto>{
          phoneNumber: phoneNumber,
          providerSub: payload.sub,
          provider: payload.provider,
          languageLocale: LanguageLocale[normalizedLang],
          name: this.kakaoRepository.getUserName(payload, kakaoUser?.kakao_account),
        })

        return new AuthTokenResponse(token, true)
      }
    }
  }

  private async createAuthCode(factor: AuthFactor, ip: string) {
    if ((!factor.phoneNumber && !factor.email) || (factor.phoneNumber && factor.email)) {
      throw new BadRequestException("Invalid request")
    }
    if (await this.alreadyRequested(factor)) {
      const authCode = await this.authRepository.findOneOrFail({
        where: factor.email ? { email: factor.email } : { phoneNumber: factor.phoneNumber },
      })
      await this.checkDelay(ip)
      await this.authRepository.remove(authCode)
    }
    return await this.authRepository.save({
      code: randomXDigit(DEFAULT_VERIFICATION_CODE_DIGIT),
      phoneNumber: factor.phoneNumber,
      email: factor.email,
      ip: ip,
    })
  }

  private async findAuthCodeByEmail(email: string, code: string) {
    return await this.authRepository.findOne({
      where: { email: email, code: code },
    })
  }

  private async findAuthCodeByPhoneNumber(phoneNumber: string, code: string) {
    return await this.authRepository.findOne({
      where: { phoneNumber: phoneNumber, code: code },
    })
  }

  private async authenticateByCode(authCode?: AuthCode, name?: string) {
    const lang = I18nContext.current().lang
    if (!authCode) {
      throw new UnauthorizedException(this.i18n.t("MESSAGES.ERROR.UNAUTHORIZED", { lang }))
    }
    if (!authCode.phoneNumber && !authCode.email) {
      throw new UnauthorizedException(this.i18n.t("MESSAGES.ERROR.UNAUTHORIZED", { lang }))
    }
    const user = await this.findUserByAuth(authCode)
    const token = user ? await this.getSignedToken(user) : await this.signUpByAuthentication(authCode, name)
    await this.authRepository.remove(authCode)
    return new AuthTokenResponse(token, false)
  }

  private async findUserByAuth(authCode: AuthCode) {
    return authCode.phoneNumber
      ? await this.findUserByPhoneNumber(authCode.phoneNumber)
      : await this.findUserByEmail(authCode.email)
  }

  private async signUpByAuthentication(authCode: AuthCode, name?: string) {
    const lang = I18nContext.current()?.lang ?? "en"

    // Normalize language for enum keys
    const normalizedLang = lang === "zh-TW" ? "zhTW" : (lang as keyof typeof LanguageLocale)

    return await this.signUp(<SignUpDto>{
      phoneNumber: authCode.phoneNumber,
      email: authCode.email,
      languageLocale: LanguageLocale[normalizedLang],
      name,
    })
  }

  private async checkDelay(ip: string) {
    const latestCode = await this.authRepository.find({
      where: { ip: ip },
      order: { createdAt: "DESC" },
      take: 1,
    })
    if (latestCode?.length > 0 && Date.now() - new Date(latestCode[0].createdAt).getTime() < SIXTY_SECONDS) {
      throw new BadRequestException(this.i18n.t("MESSAGES.ERROR.DELAY_LIMIT", { lang: I18nContext.current().lang }))
    }
  }

  private async alreadyRequested(factor: AuthFactor) {
    const where = factor.email ? { email: factor.email } : { phoneNumber: factor.phoneNumber }
    return (await this.authRepository.count({ where: where })) > 0
  }

  private async findUserByPhoneNumber(phoneNumber: string) {
    return await this.datasource.manager.findOneBy(AccountUser, { phoneNumber: phoneNumber })
  }

  private async findUserByEmail(email: string) {
    return await this.datasource.manager.findOneBy(AccountUser, { email: email })
  }
}
