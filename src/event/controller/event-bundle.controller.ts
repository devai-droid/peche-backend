import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { EventBundleService } from "@root/event/service/event-bundle.service"
import { EventBundleQueryDto } from "@root/event/dto/event-bundle-query.dto"
import { CreateEventBundleDto, EventBundleList, UpdateEventBundleDto } from "@root/event/dto/event-bundle.dto"
import { EventBundle } from "@root/event/entities/event-bundle.entity"

@Controller("event-bundle")
@ApiTags("event-bundle")
export class EventBundleController {
  constructor(private readonly eventBundleService: EventBundleService) {}

  @ApiOkResponse({ type: EventBundleList })
  @Get("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async findMany(@Query() query: EventBundleQueryDto) {
    return this.eventBundleService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: EventBundle, isArray: true })
  @Get("visible")
  async findVisible() {
    return this.eventBundleService.findVisible()
  }

  @ApiOkResponse({ type: EventBundle })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateEventBundleDto) {
    return this.eventBundleService.create(dto)
  }

  @ApiOkResponse({ type: EventBundle })
  @Put(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateEventBundleDto) {
    return this.eventBundleService.update(id, dto)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventBundleService.remove(id)
  }
}
