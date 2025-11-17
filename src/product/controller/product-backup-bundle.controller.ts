import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { ProductBackupBundleService } from "@root/product/service/product-backup-bundle.service"
import { ProductBackupBundleList } from "@root/product/dto/product-backup-bundle.dto"
import { ProductBackupBundle } from "@root/product/entities/product-backup-bundle.entity"
import { ProductBackupBundleQueryDto } from "@root/product/dto/product-backup-bundle-query.dto"

@Controller("product-backup-bundle")
@ApiTags("product-backup-bundle")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class ProductBackupBundleController {
  constructor(private readonly productBackupBundleService: ProductBackupBundleService) {}

  @ApiOkResponse({ type: ProductBackupBundleList })
  @Get("")
  async findMany(@Query() query: ProductBackupBundleQueryDto) {
    return this.productBackupBundleService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: ProductBackupBundle })
  @Post("")
  async create() {
    return this.productBackupBundleService.create()
  }

  @ApiOkResponse({ type: ProductBackupBundle })
  @Put(":id")
  async update(@Param("id", ParseUUIDPipe) id: string) {
    return this.productBackupBundleService.loadBundle(id)
  }

  @Delete(":id")
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.productBackupBundleService.remove(id)
  }
}
