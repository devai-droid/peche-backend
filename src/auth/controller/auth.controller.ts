import { Body, Controller, Post, Req, UseFilters } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { Request } from "express"
import { AuthService } from "../service/auth.service"
import {
  CodeAuthByEmailDto,
  CodeAuthByPhoneDto,
  CreateEmailCodeDto,
  CreatePhoneCodeDto,
  SocialAuthDto,
} from "../dto/auth-sign-in.dto"
import { AuthExceptionFilter } from "../../shared/exception/auth-exception.filter"
import { AuthTokenResponse } from "@root/auth/dto/auth-sign-up.dto"
import { getIpFromRequest } from "@root/shared/helper/base.helper"

@Controller("auth")
@ApiTags("auth")
@UseFilters(new AuthExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("kakao")
  @ApiResponse({ type: AuthTokenResponse })
  @ApiOperation({ summary: "로그인 성공 시 인증 토큰 생성" })
  async authenticateByKakao(@Body() dto: SocialAuthDto) {
    return this.authService.authenticateByKakao(dto)
  }

  @Post("phone")
  @ApiResponse({ type: AuthTokenResponse })
  @ApiOperation({ summary: "로그인 성공 시 인증 토큰 생성" })
  async authenticateByPhone(@Body() dto: CodeAuthByPhoneDto) {
    return this.authService.authenticateByPhone(dto)
  }

  @Post("email")
  @ApiResponse({ type: AuthTokenResponse })
  @ApiOperation({ summary: "로그인 성공 시 인증 토큰 생성" })
  async authenticateByEmail(@Body() dto: CodeAuthByEmailDto) {
    return this.authService.authenticateByEmail(dto)
  }

  @Post("phone-code")
  async createPhoneCode(@Body() dto: CreatePhoneCodeDto, @Req() request: Request) {
    return this.authService.createAuthCodeByPhone(dto, getIpFromRequest(request))
  }

  @Post("email-code")
  async createEmailCode(@Body() dto: CreateEmailCodeDto, @Req() request: Request) {
    return this.authService.createAuthCodeByEmail(dto, getIpFromRequest(request))
  }
}
