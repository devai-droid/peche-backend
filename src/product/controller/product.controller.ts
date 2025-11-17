import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { ProductService } from "@root/product/service/product.service"
import {
  CreateProductDto,
  ImportFromGoogleSpreadsheetProductDto,
  ProductList,
  UpdateProductDto,
} from "@root/product/dto/product.dto"
import { ProductQueryDto } from "@root/product/dto/product-query.dto"
import { Product } from "@root/product/entities/product.entity"

@Controller("products")
@ApiTags("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOkResponse({ type: ProductList })
  @Get("")
  async findMany(@Query() query: ProductQueryDto) {
    return this.productService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: Product })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto)
  }

  @ApiOkResponse({ type: Product })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto, @AuthUser() user?: User) {
    return this.productService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.productService.remove(id)
  }

  @ApiOkResponse({ type: Product, isArray: true })
  @Post("import-from-google-spreadsheet")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async import(@Body() dto: ImportFromGoogleSpreadsheetProductDto) {
    return this.productService.importFromGoogleSpreadsheet(dto)
  }
}
