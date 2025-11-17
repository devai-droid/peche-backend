import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { ProductBackupService } from "@root/product/service/product-backup.service"
import { ProductBackupQueryDto } from "@root/product/dto/product-backup-query.dto"
import { CreateProductBackupDto, ProductBackupList, UpdateProductBackupDto } from "@root/product/dto/product-backup.dto"
import { User } from "@root/shared/interface/user"
import { ProductBackup } from "@root/product/entities/product-backup.entity"

@Controller("product-backup")
@ApiTags("product-backup")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class ProductBackupController {
  constructor(private readonly productBackupService: ProductBackupService) {}

  @ApiOkResponse({ type: ProductBackupList })
  @Get("")
  async findMany(@Query() query: ProductBackupQueryDto) {
    return this.productBackupService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: ProductBackup })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateProductBackupDto) {
    return this.productBackupService.create(dto)
  }

  @ApiOkResponse({ type: ProductBackup })
  @Put(":id")
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateProductBackupDto, @AuthUser() user?: User) {
    return this.productBackupService.update(id, dto, user)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.productBackupService.remove(id)
  }
}
