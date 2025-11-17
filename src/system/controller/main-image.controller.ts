import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { MainImageService } from "@root/system/service/main-image.service"
import { CreateMainImageDto, MainImageList, UpdateMainImageDto } from "@root/system/dto/main-image.dto"
import { MainImageQueryDto } from "@root/system/dto/main-image-query.dto"
import { MainImage } from "@root/system/entities/main-image.entity"

@Controller("main-images")
@ApiTags("main-images")
export class MainImageController {
  constructor(private readonly mainImageService: MainImageService) {}

  @ApiOkResponse({ type: MainImageList })
  @Get("")
  async findMany(@Query() query: MainImageQueryDto) {
    return this.mainImageService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: MainImage })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateMainImageDto) {
    return this.mainImageService.create(dto)
  }

  @ApiOkResponse({ type: MainImage })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateMainImageDto, @AuthUser() user?: User) {
    return this.mainImageService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.mainImageService.remove(id)
  }
}
