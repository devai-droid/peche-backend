import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { MainPopupService } from "@root/system/service/main-popup.service"
import { MainPopupQueryDto } from "@root/system/dto/main-popup-query.dto"
import { CreateMainPopupDto, MainPopupList, UpdateMainPopupDto } from "@root/system/dto/main-popup.dto"
import { MainPopup } from "@root/system/entities/main-popup.entity"
import { User } from "@root/shared/interface/user"

@Controller("main-popup")
@ApiTags("main-popup")
export class MainPopupController {
  constructor(private readonly mainPopupService: MainPopupService) {}

  @ApiOkResponse({ type: MainPopupList })
  @Get("")
  async findMany(@Query() query: MainPopupQueryDto) {
    return this.mainPopupService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: MainPopup })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateMainPopupDto) {
    return this.mainPopupService.create(dto)
  }

  @ApiOkResponse({ type: MainPopup })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateMainPopupDto, @AuthUser() user?: User) {
    return this.mainPopupService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.mainPopupService.remove(id)
  }
}
