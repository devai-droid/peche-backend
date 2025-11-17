import { Body, Controller, Get, Post, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { ReservationSlotService } from "@root/reservation/service/reservation-slot.service"
import { BulkCreateReservationSlotDto, ReservationSlotList } from "@root/reservation/dto/reservation-slot.dto"
import { ReservationSlotQueryDto } from "@root/reservation/dto/reservation-slot-query.dto"
import { ReservationSlot } from "@root/reservation/entities/reservation-slot.entity"

@Controller("reservation-slots")
@ApiTags("reservation-slots")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class ReservationSlotController {
  constructor(private readonly reservationSlotService: ReservationSlotService) {}

  @ApiOkResponse({ type: ReservationSlotList })
  @Get("")
  async findMany(@Query() query: ReservationSlotQueryDto) {
    return this.reservationSlotService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: ReservationSlot, isArray: true })
  @Post("")
  async createOrUpdate(@Body() dtos: BulkCreateReservationSlotDto) {
    return this.reservationSlotService.bulkCreateOrUpdate(dtos.dto)
  }
}
