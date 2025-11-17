import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Event } from "@root/event/entities/event.entity"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { EventService } from "@root/event/service/event.service"
import {
  CreateEventDto,
  EventList,
  ImportFromGoogleSpreadsheetEventDto,
  UpdateEventDto,
} from "@root/event/dto/event.dto"
import { EventQueryDto } from "@root/event/dto/event-query.dto"

@Controller("events")
@ApiTags("events")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOkResponse({ type: EventList })
  @Get("")
  async findMany(@Query() query: EventQueryDto) {
    return this.eventService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: Event })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto)
  }

  @ApiOkResponse({ type: Event })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateEventDto, @AuthUser() user?: User) {
    return this.eventService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventService.remove(id)
  }

  @ApiOkResponse({ type: Event, isArray: true })
  @Post("import-from-google-spreadsheet")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async import(@Body() dto: ImportFromGoogleSpreadsheetEventDto) {
    return this.eventService.importFromGoogleSpreadsheet(dto)
  }
}
