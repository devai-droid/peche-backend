import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { ProductQueryDto } from "@root/product/dto/product-query.dto"
import { EventBackupBundleService } from "@root/event/service/event-backup-bundle.service"
import {
  CreateEventBackupBundleDto,
  EventBackupBundleList,
  LoadEventBackupBundleDto,
} from "@root/event/dto/event-backup-bundle.dto"
import { EventBackupBundle } from "@root/event/entities/event-backup-bundle.entity"
import { Event } from "@root/event/entities/event.entity"

@Controller("event-backup-bundle")
@ApiTags("event-backup-bundle")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class EventBackupBundleController {
  constructor(private readonly eventBackupBundleService: EventBackupBundleService) {}

  @ApiOkResponse({ type: EventBackupBundleList })
  @Get("")
  async findMany(@Query() query: ProductQueryDto) {
    return this.eventBackupBundleService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: EventBackupBundle })
  @Post("")
  async create(@Body() dto: CreateEventBackupBundleDto) {
    return this.eventBackupBundleService.create(dto)
  }

  @ApiOkResponse({ type: Event, isArray: true })
  @Put(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: LoadEventBackupBundleDto) {
    return this.eventBackupBundleService.loadBundle(id, dto)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventBackupBundleService.remove(id)
  }
}
