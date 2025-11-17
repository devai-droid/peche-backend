import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { CreateCelebPicturesDto, CelebPicturesList, UpdateCelebPicturesDto } from "@root/system/dto/celeb-pictures.dto"
import { CelebPicturesService } from "@root/system/service/celeb-pictures.service"
import { CelebPicturesQueryDto } from "@root/system/dto/celeb-pictures-query.dto"
import { CelebPictures } from "@root/system/entities/celeb-pictures.entity"

@Controller("celeb-pictures")
@ApiTags("celeb-pictures")
export class CelebPicturesController {
  constructor(private readonly celebPicturesService: CelebPicturesService) {}

  @ApiOkResponse({ type: CelebPicturesList })
  @Get("")
  async findMany(@Query() query: CelebPicturesQueryDto) {
    return this.celebPicturesService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: CelebPictures })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateCelebPicturesDto) {
    return this.celebPicturesService.create(dto)
  }

  @ApiOkResponse({ type: CelebPictures })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateCelebPicturesDto, @AuthUser() user?: User) {
    return this.celebPicturesService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.celebPicturesService.remove(id)
  }
}
