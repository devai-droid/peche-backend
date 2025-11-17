import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { CloseDayService } from "@root/reservation/service/close-day.service"
import { CloseDayList, CreateCloseDayDto, UpdateCloseDayDto } from "@root/reservation/dto/close-day.dto"
import { CloseDayQueryDto } from "@root/reservation/dto/close-day-query.dto"
import { CloseDay } from "@root/reservation/entities/close-day.entity"

@Controller("close-days")
@ApiTags("close-days")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class CloseDayController {
  constructor(private readonly closeDayService: CloseDayService) {}

  @ApiOkResponse({ type: CloseDayList })
  @Get("")
  async findMany(@Query() query: CloseDayQueryDto) {
    return this.closeDayService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: CloseDay })
  @Post("")
  async create(@Body() dto: CreateCloseDayDto) {
    return this.closeDayService.create(dto)
  }

  @ApiOkResponse({ type: CloseDay })
  @Put(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateCloseDayDto, @AuthUser() user?: User) {
    return this.closeDayService.update(id, dto, user)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.closeDayService.remove(id)
  }
}
