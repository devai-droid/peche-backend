import { Body, Controller, Get, Param, Post } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { SystemConstantsService } from "@root/system/service/system-constants.service"
import { SystemConstantsKey } from "@root/shared/enum/system"
import { CreateOrUpdateSystemConstantsDto } from "@root/system/dto/system-constants.dto"
import { SystemConstants } from "@root/system/entities/system-constants.entity"

@Controller("system-constants")
@ApiTags("system-constants")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class SystemConstantsController {
  constructor(private readonly systemConstantsService: SystemConstantsService) {}

  @ApiOkResponse({ type: SystemConstants })
  @Get(":key")
  async findOne(@Param("key") key: SystemConstantsKey) {
    return this.systemConstantsService.findOne(key)
  }

  @ApiOkResponse({ type: SystemConstants })
  @Post("")
  async createOrUpdate(@Body() dto: CreateOrUpdateSystemConstantsDto) {
    return this.systemConstantsService.createOrUpdate(dto)
  }
}
