import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { CreateMostPopularCategoryDto, UpdateMostPopularCategoryDto } from "../dto/most-popular-category.dto"
import { MostPopularCategory } from "../entities/most-popular-category.entity"
import { MostPopularCategoryService } from "../service/most-popular-category.service"

@Controller("most-popular-categories")
@ApiTags("most-popular-categories")
export class MostPopularCategoryController {
  constructor(private readonly categoryService: MostPopularCategoryService) {}

  @ApiOkResponse({ type: [MostPopularCategory] })
  @Get("")
  async findAll() {
    return this.categoryService.findAll()
  }

  @ApiOkResponse({ type: MostPopularCategory })
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id)
  }

  @ApiOkResponse({ type: MostPopularCategory })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateMostPopularCategoryDto) {
    return this.categoryService.create(dto)
  }

  @ApiOkResponse({ type: MostPopularCategory })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateMostPopularCategoryDto,
    @AuthUser() user?: User,
  ) {
    return this.categoryService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id)
  }
}
