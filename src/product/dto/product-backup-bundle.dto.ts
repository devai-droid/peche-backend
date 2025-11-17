import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { ProductBackupBundle } from "@root/product/entities/product-backup-bundle.entity"

export interface ProductBackupBundleDto {
  name?: string
}

export class CreateProductBackupBundleDto implements ProductBackupBundleDto {
  @ApiPropertyOptional() @IsOptional() readonly name?: string
}

export class ProductBackupBundleList extends Paginated {
  @ApiProperty({ type: ProductBackupBundle, isArray: true }) items: ProductBackupBundle[]
}
