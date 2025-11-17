import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { EventBackupService } from "@root/event/service/event-backup.service"
import { CreateEventBackupDto, EventBackupList, UpdateEventBackupDto } from "@root/event/dto/event-backup.dto"
import { EventBackup } from "@root/event/entities/event-backup.entity"
import { EventBackupQueryDto } from "@root/event/dto/event-backup-query.dto"

@Controller("event-backup")
@ApiTags("event-backup")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class EventBackupController {
  constructor(private readonly eventBackupService: EventBackupService) {}

  @ApiOkResponse({ type: EventBackupList })
  @Get("")
  async findMany(@Query() query: EventBackupQueryDto) {
    return this.eventBackupService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: EventBackup })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateEventBackupDto) {
    return this.eventBackupService.create(dto)
  }

  @ApiOkResponse({ type: EventBackup })
  @Put(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateEventBackupDto, @AuthUser() user?: User) {
    return this.eventBackupService.update(id, dto, user)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventBackupService.remove(id)
  }
}
