import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, Req } from "@nestjs/common"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { AuthGuard } from "@nestjs/passport"
import { Request } from "express"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { getIpFromRequest } from "@root/shared/helper/base.helper"
import { B2bService } from "@root/b2b/service/b2b.service"
import {
  B2bLookupCodeDto,
  B2bLookupVerifyDto,
  B2bLookupVerifyResponse,
  B2bNoticeDto,
  B2bRequestCodeDto,
  B2bReservationList,
  B2bReservationQueryDto,
  B2bVerifyDto,
  B2bVerifyResponse,
  CreateB2bCompanyDto,
  UpdateB2bCompanyDto,
} from "@root/b2b/dto/b2b.dto"
import { B2bCompany } from "@root/b2b/entities/b2b-company.entity"
import { CreateReservationDto } from "@root/reservation/dto/reservation.dto"
import { Reservation } from "@root/reservation/entities/reservation.entity"

/** B2B 사이트: 회사 이메일 인증 → 예약 1건 */
@Controller("b2b")
@ApiTags("b2b")
export class B2bController {
  constructor(private readonly service: B2bService) {}

  @Get("notice")
  @ApiOkResponse({ type: B2bNoticeDto })
  @ApiOperation({ summary: "예약 화면 안내 문구(공개)" })
  async getNotice() {
    return this.service.getNotice()
  }

  @Post("auth/code")
  @ApiOperation({ summary: "협약사 회사 이메일로 인증번호 발송" })
  async requestCode(@Body() dto: B2bRequestCodeDto, @Req() request: Request) {
    return this.service.requestCode(dto, getIpFromRequest(request))
  }

  @Post("auth/verify")
  @ApiOkResponse({ type: B2bVerifyResponse })
  @ApiOperation({ summary: "인증번호 확인 → 예약 1건용 토큰(30분)" })
  async verify(@Body() dto: B2bVerifyDto) {
    return this.service.verify(dto)
  }

  @Post("lookup/code")
  @ApiOperation({ summary: "예약확인용: 협약사 회사 이메일로 인증번호 발송" })
  async requestLookupCode(@Body() dto: B2bLookupCodeDto, @Req() request: Request) {
    return this.service.requestLookupCode(dto, getIpFromRequest(request))
  }

  @Post("lookup/verify")
  @ApiOkResponse({ type: B2bLookupVerifyResponse })
  @ApiOperation({ summary: "예약확인용: 인증번호 확인 → 30분 토큰(본인 예약 조회·변경·취소)" })
  async verifyLookup(@Body() dto: B2bLookupVerifyDto) {
    return this.service.verifyLookup(dto)
  }

  @Post("reservations")
  @ApiOkResponse({ type: Reservation })
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.USER)
  @ApiOperation({ summary: "B2B 예약 생성(인증 1건 소모)" })
  async createReservation(@Body() dto: CreateReservationDto, @AuthUser() user: User) {
    return this.service.createReservation(dto, user)
  }
}

/** 어드민: 협약사 관리 + B2B 예약 이력 */
@Controller("b2b/admin")
@ApiTags("b2b-admin")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class B2bAdminController {
  constructor(private readonly service: B2bService) {}

  @Get("companies")
  @ApiOkResponse({ type: B2bCompany, isArray: true })
  async findCompanies() {
    return this.service.findCompanies()
  }

  @Post("companies")
  @ApiOkResponse({ type: B2bCompany })
  async createCompany(@Body() dto: CreateB2bCompanyDto, @AuthUser() user: User) {
    return this.service.createCompany(dto, user)
  }

  @Put("companies/:id")
  @ApiOkResponse({ type: B2bCompany })
  async updateCompany(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateB2bCompanyDto,
    @AuthUser() user: User,
  ) {
    return this.service.updateCompany(id, dto, user)
  }

  @Put("notice")
  @ApiOkResponse({ type: B2bNoticeDto })
  async updateNotice(@Body() dto: B2bNoticeDto, @AuthUser() user: User) {
    return this.service.updateNotice(dto, user)
  }

  @Get("reservations")
  @ApiOkResponse({ type: B2bReservationList })
  async findReservations(@Query() query: B2bReservationQueryDto) {
    return this.service.findReservations(query)
  }
}
