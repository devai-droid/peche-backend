import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { ProductDetailPageService } from "@root/product/service/product-detail-page.service"
import {
  CreateProductDetailPageDto,
  ProductDetailPageList,
  UpdateProductDetailPageDto,
} from "@root/product/dto/product-detail-page.dto"
import { ProductDetailPage } from "@root/product/entities/product-detail-page.entity"
import { ProductDetailPageQueryDto } from "@root/product/dto/product-detail-page-query.dto"

@Controller("product-detail-pages")
@ApiTags("product-detail-pages")
export class ProductDetailPageController {
  constructor(private readonly productDetailPageService: ProductDetailPageService) {}

  @ApiOkResponse({ type: ProductDetailPageList })
  @Get("")
  async findMany(@Query() query: ProductDetailPageQueryDto) {
    return this.productDetailPageService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: ProductDetailPage })
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.productDetailPageService.findOne(id)
  }

  @ApiOkResponse({ type: ProductDetailPage })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateProductDetailPageDto) {
    return this.productDetailPageService.create(dto)
  }

  @ApiOkResponse({ type: ProductDetailPage })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDetailPageDto,
    @AuthUser() user?: User,
  ) {
    return this.productDetailPageService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.productDetailPageService.remove(id)
  }
}
