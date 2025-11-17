import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { ProductBackup } from "@root/product/entities/product-backup.entity"

export class CreateProductBackupDto {
  @ApiProperty() @IsUUID() readonly backupBundleId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly categoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly detailPageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly integratedCrmCategoryId?: string
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionTH?: string
  @ApiProperty() price?: number
  @ApiPropertyOptional() @IsOptional() order?: number
  @ApiPropertyOptional() @IsOptional() orderEN?: number
  @ApiPropertyOptional() @IsOptional() orderZH?: number
  @ApiPropertyOptional() @IsOptional() orderZHTW?: number
  @ApiPropertyOptional() @IsOptional() orderJA?: number
  @ApiPropertyOptional() @IsOptional() orderTH?: number
  @ApiPropertyOptional() @IsOptional() visible?: boolean
  @ApiPropertyOptional() @IsOptional() visibleEN?: boolean
  @ApiPropertyOptional() @IsOptional() visibleZH?: boolean
  @ApiPropertyOptional() @IsOptional() visibleZHTW?: boolean
  @ApiPropertyOptional() @IsOptional() visibleJA?: boolean
  @ApiPropertyOptional() @IsOptional() visibleTH?: boolean
}

export class UpdateProductBackupDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly categoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly detailPageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly integratedCrmCategoryId?: string
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionTH?: string
  @ApiProperty() price?: number
  @ApiPropertyOptional() @IsOptional() order?: number
  @ApiPropertyOptional() @IsOptional() orderEN?: number
  @ApiPropertyOptional() @IsOptional() orderZH?: number
  @ApiPropertyOptional() @IsOptional() orderZHTW?: number
  @ApiPropertyOptional() @IsOptional() orderJA?: number
  @ApiPropertyOptional() @IsOptional() orderTH?: number
  @ApiPropertyOptional() @IsOptional() visible?: boolean
  @ApiPropertyOptional() @IsOptional() visibleEN?: boolean
  @ApiPropertyOptional() @IsOptional() visibleZH?: boolean
  @ApiPropertyOptional() @IsOptional() visibleZHTW?: boolean
  @ApiPropertyOptional() @IsOptional() visibleJA?: boolean
  @ApiPropertyOptional() @IsOptional() visibleTH?: boolean
}

export class ProductBackupList extends Paginated {
  @ApiProperty({ type: ProductBackup, isArray: true }) items: ProductBackup[]
}
