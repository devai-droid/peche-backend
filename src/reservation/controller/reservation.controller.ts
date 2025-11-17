import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { ReservationService } from "@root/reservation/service/reservation.service"
import {
  AvailableReservationByDayDto,
  AvailableReservationByMonthDto,
  AvailableReservationResultDto,
  CreateReservationDto,
  ReservationCountByDayResultDto,
  ReservationCountByMonthDto,
  ReservationList,
  UpdateReservationDto,
} from "@root/reservation/dto/reservation.dto"
import { ReservationQueryDto } from "@root/reservation/dto/reservation-query.dto"
import { Reservation } from "@root/reservation/entities/reservation.entity"

@Controller("reservations")
@ApiTags("reservations")
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @ApiOkResponse({ type: ReservationList })
  @Get()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async findMany(@Query() query: ReservationQueryDto) {
    return this.reservationService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: Reservation })
  @Post()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.USER)
  async create(@Body() dto: CreateReservationDto, @AuthUser() user: User) {
    return this.reservationService.create(dto, user)
  }

  @ApiOkResponse({ type: Reservation })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateReservationDto, @AuthUser() user?: User) {
    return this.reservationService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.reservationService.remove(id)
  }

  @ApiOkResponse({ type: ReservationList })
  @Get("/mine")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async findMine(@Query() query: ReservationQueryDto, @AuthUser() user: User) {
    return this.reservationService.refreshAndFindReservation(Object.assign(query, { userId: user.id }), user)
  }

  @ApiOkResponse({ type: AvailableReservationResultDto, isArray: true })
  @Get("available-by-month")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.USER)
  async getAvailableReservationByMonth(@Query() query: AvailableReservationByMonthDto, @AuthUser() user: User) {
    return this.reservationService.getAvailableReservationByMonth(query, user)
  }

  @ApiOkResponse({ type: AvailableReservationResultDto, isArray: true })
  @Get("available-by-day")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.USER)
  async getAvailableReservationByDay(@Query() query: AvailableReservationByDayDto, @AuthUser() user: User) {
    return this.reservationService.getAvailableReservationByDay(query, user)
  }

  @ApiOkResponse({ type: ReservationCountByDayResultDto, isArray: true })
  @Get("count-by-month")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async getReservationSlotsByMonth(@Query() query: ReservationCountByMonthDto) {
    return this.reservationService.getReservationSlotsByMonth(query)
  }
}
