import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { Product } from "@root/product/entities/product.entity"

export interface ProductDto {
  categoryId?: string
  detailPageId?: string
  integratedCrmCategoryId?: string
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  nameJA?: string
  nameTH?: string
  description?: string
  descriptionEN?: string
  descriptionZH?: string
  descriptionZHTW?: string
  descriptionJA?: string
  descriptionTH?: string
  price?: number
  order?: number
  orderEN?: number
  orderZH?: number
  orderZHTW?: number
  orderJA?: number
  orderTH?: number
  visible?: boolean
  visibleEN?: boolean
  visibleZH?: boolean
  visibleZHTW?: boolean
  visibleJA?: boolean
  visibleTH?: boolean
}

export class CreateProductDto implements ProductDto {
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

export class UpdateProductDto implements ProductDto {
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

export class ProductList extends Paginated {
  @ApiProperty({ type: Product, isArray: true }) items: Product[]
}

export class CreateProductFromGoogleSpreadsheetDto {
  visible?: boolean
  visibleEN?: boolean
  visibleZH?: boolean
  visibleZHTW?: boolean
  visibleJA?: boolean
  visibleTH?: boolean
  categoryName?: string
  detailPageName?: string
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  nameJA?: string
  nameTH?: string
  description?: string
  descriptionEN?: string
  descriptionZH?: string
  descriptionZHTW?: string
  descriptionJA?: string
  descriptionTH?: string
  price?: number
  order?: number
  orderEN?: number
  orderZH?: number
  orderZHTW?: number
  orderJA?: number
  orderTH?: number
}

export class ImportFromGoogleSpreadsheetProductDto {
  @ApiProperty() url?: string
}

export class ImportFromGoogleSpreadsheetProductV2Dto {
  @ApiProperty() url?: string
}

export class CreateCategoryFromSheetDto {
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  nameJA?: string
  nameTH?: string
  order?: number
}

export class CreateDetailPageFromSheetDto {
  categoryName?: string
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  nameJA?: string
  nameTH?: string
  description?: string
  descriptionEN?: string
  descriptionZH?: string
  descriptionZHTW?: string
  descriptionJA?: string
  descriptionTH?: string
  order?: number
}
