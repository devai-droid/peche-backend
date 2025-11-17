import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { ProductCategoryService } from "@root/product/service/product-category.service"
import {
  CreateProductCategoryDto,
  ProductCategoryList,
  UpdateProductCategoryDto,
} from "@root/product/dto/product-category.dto"
import { ProductCategory } from "@root/product/entities/product-category.entity"
import { User } from "@root/shared/interface/user"
import { ProductCategoryQueryDto } from "@root/product/dto/product-category-query.dto"

@Controller("product-categories")
@ApiTags("product-categories")
export class ProductCategoryController {
  constructor(private readonly productCategoryService: ProductCategoryService) {}

  @ApiOkResponse({ type: ProductCategoryList })
  @Get("")
  async findMany(@Query() query: ProductCategoryQueryDto) {
    return this.productCategoryService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: ProductCategory })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateProductCategoryDto) {
    return this.productCategoryService.create(dto)
  }

  @ApiOkResponse({ type: ProductCategory })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateProductCategoryDto, @AuthUser() user?: User) {
    return this.productCategoryService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.productCategoryService.remove(id)
  }
}
