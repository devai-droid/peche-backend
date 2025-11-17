import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional } from "class-validator"
import { ProductCategoryStatus } from "@root/shared/enum/product"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { ProductCategory } from "@root/product/entities/product-category.entity"

export interface ProductCategoryDto {
  status?: ProductCategoryStatus
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  nameJA?: string
  nameTH?: string
  order?: number
}

export class CreateProductCategoryDto implements ProductCategoryDto {
  @ApiPropertyOptional({ enum: ProductCategoryStatus })
  @IsOptional()
  @IsEnum(ProductCategoryStatus)
  readonly status?: ProductCategoryStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() order?: number
}

export class UpdateProductCategoryDto implements ProductCategoryDto {
  @ApiPropertyOptional({ enum: ProductCategoryStatus })
  @IsOptional()
  @IsEnum(ProductCategoryStatus)
  readonly status?: ProductCategoryStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() order?: number
}

export class ProductCategoryList extends Paginated {
  @ApiProperty({ type: ProductCategory, isArray: true }) items: ProductCategory[]
}
