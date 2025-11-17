import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { EventCategoryService } from "@root/event/service/event-category.service"
import { EventCategory } from "@root/event/entities/event-category.entity"
import { CreateEventCategoryDto, EventCategoryList, UpdateEventCategoryDto } from "@root/event/dto/event-category.dto"
import { EventCategoryQueryDto } from "@root/event/dto/event-category-query.dto"

@Controller("event-categories")
@ApiTags("event-categories")
export class EventCategoryController {
  constructor(private readonly eventCategoryService: EventCategoryService) {}

  @ApiOkResponse({ type: EventCategoryList })
  @Get("")
  async findManyWithPaginationQuery(@Query() query: EventCategoryQueryDto) {
    return this.eventCategoryService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: EventCategory })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateEventCategoryDto) {
    return this.eventCategoryService.create(dto)
  }

  @ApiOkResponse({ type: EventCategory })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateEventCategoryDto, @AuthUser() user?: User) {
    return this.eventCategoryService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventCategoryService.remove(id)
  }
}
