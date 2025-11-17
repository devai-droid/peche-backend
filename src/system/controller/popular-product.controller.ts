import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import {
  CreatePopularProductDto,
  PopularProductList,
  UpdatePopularProductDto,
} from "@root/system/dto/popular-product.dto"
import { PopularProductService } from "@root/system/service/popular-product.service"
import { PopularProductQueryDto } from "@root/system/dto/popular-product-query.dto"
import { PopularProduct } from "@root/system/entities/popular-product.entity"

@Controller("popular-products")
@ApiTags("popular-products")
export class PopularProductController {
  constructor(private readonly popularProductService: PopularProductService) {}

  @ApiOkResponse({ type: PopularProductList })
  @Get("")
  async findMany(@Query() query: PopularProductQueryDto) {
    return this.popularProductService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: PopularProduct })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreatePopularProductDto) {
    return this.popularProductService.create(dto)
  }

  @ApiOkResponse({ type: PopularProduct })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdatePopularProductDto, @AuthUser() user?: User) {
    return this.popularProductService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.popularProductService.remove(id)
  }
}
