import { Body, Controller, ForbiddenException, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiExcludeEndpoint, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { AuthService } from "@root/auth/service/auth.service"
import { AuthSignInDto } from "@root/auth/dto/auth-sign-in.dto"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { CreateVerificationDto, PasswordResetDto, VerifiedCode } from "@root/auth/dto/verification.dto"
import { VerificationService } from "@root/auth/service/verification.service"
import { PasswordChangeDto } from "@root/auth/dto/password.dto"
import { AuthSignUpDto } from "@root/auth/dto/auth-sign-up.dto"

@Controller("admin-auth")
export class AdminAuthController {
  constructor(
    private readonly config: ConfigService,
    private readonly service: AuthService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post("login")
  async login(@Body() dto: AuthSignInDto) {
    return this.service.signIn(dto)
  }

  @Post("signup")
  async registerUser(@Body() dto: AuthSignUpDto) {
    return this.service.signUp(dto)
  }

  @Post("password-reset")
  @ApiOperation({ summary: "비밀번호 초기화 인증코드 생성 후 발송" })
  async createPasswordResetVerification(@Body() dto: CreateVerificationDto) {
    return this.verificationService.createPasswordResetVerification(dto)
  }

  @Put("password-reset")
  @ApiResponse({ type: VerifiedCode })
  @ApiOperation({ summary: "비밀번호 초기화 인증 결과를 반환" })
  async verifyPasswordReset(@Body() dto: PasswordResetDto) {
    return this.verificationService.resetPassword(dto)
  }

  @Post("change-password")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.USER)
  async changePassword(@Body() dto: PasswordChangeDto, @AuthUser() user: User) {
    return this.service.changePassword(dto, user.id)
  }

  @Post("admin-jwt")
  @ApiExcludeEndpoint()
  async adminJwt() {
    if (this.config.get("STAGE") != "dev") {
      throw new ForbiddenException("not allowed")
    }
    return this.service.getAdminToken()
  }

  @Post(":id/jwt")
  @ApiExcludeEndpoint()
  async userJwt(@Param("id", ParseUUIDPipe) userId: string) {
    if (this.config.get("STAGE") != "dev") {
      throw new ForbiddenException("not allowed")
    }
    return this.service.getUserToken(userId)
  }
}
