import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { SpecificDateQueryDto } from "@root/reservation/dto/specific-date-query.dto"
import { SpecificDateService } from "@root/reservation/service/specific-date.service"
import { CreateSpecificDateDto, SpecificDateList, UpdateSpecificDateDto } from "@root/reservation/dto/specific-date.dto"
import { User } from "@root/shared/interface/user"
import { SpecificDate } from "@root/reservation/entities/specific-date.entity"
import { SpecificDateSlotService } from "@root/reservation/service/specific-date-slot.service"
import { SpecificDateSlot } from "@root/reservation/entities/specific-date-slot.entity"

@Controller("specific-date")
@ApiTags("specific-date")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class SpecificDateController {
  constructor(
    private readonly specificDateService: SpecificDateService,
    private readonly specificDateSlotService: SpecificDateSlotService,
  ) {}

  @ApiOkResponse({ type: SpecificDateList })
  @Get("")
  async findMany(@Query() query: SpecificDateQueryDto) {
    return this.specificDateService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: SpecificDateSlot, isArray: true })
  @Get(":id/slots")
  async findManySlots(@Param("id", ParseUUIDPipe) id: string) {
    return this.specificDateSlotService.findManyBySpecificDateId(id)
  }

  @ApiOkResponse({ type: SpecificDate })
  @Post("")
  async create(@Body() dto: CreateSpecificDateDto) {
    return this.specificDateService.create(dto)
  }

  @ApiOkResponse({ type: SpecificDate })
  @Put(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSpecificDateDto, @AuthUser() user?: User) {
    return this.specificDateService.update(id, dto, user)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.specificDateService.remove(id)
  }
}
