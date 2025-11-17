import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { CreateMainProductDto, MainProductList, UpdateMainProductDto } from "@root/system/dto/main-product.dto"
import { MainProductService } from "@root/system/service/main-product.service"
import { MainProductQueryDto } from "@root/system/dto/main-product-query.dto"
import { MainProduct } from "@root/system/entities/main-product.entity"

@Controller("main-products")
@ApiTags("main-products")
export class MainProductController {
  constructor(private readonly mainProductService: MainProductService) {}

  @ApiOkResponse({ type: MainProductList })
  @Get("")
  async findMany(@Query() query: MainProductQueryDto) {
    return this.mainProductService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: MainProduct })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateMainProductDto) {
    return this.mainProductService.create(dto)
  }

  @ApiOkResponse({ type: MainProduct })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateMainProductDto, @AuthUser() user?: User) {
    return this.mainProductService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.mainProductService.remove(id)
  }
}
