import { PopularProductStatus } from "@root/shared/enum/system"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { PopularProduct } from "@root/system/entities/popular-product.entity"

export interface PopularProductDto {
  status?: PopularProductStatus
  description?: string
  productName?: string
  productNameEN?: string
  productNameZH?: string
  productNameZHTW?: string
  productNameJA?: string
  productNameTH?: string
  productId?: string
  order?: number
}

export class CreatePopularProductDto implements PopularProductDto {
  @ApiPropertyOptional({ enum: PopularProductStatus })
  @IsOptional()
  @IsEnum(PopularProductStatus)
  readonly status?: PopularProductStatus
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() readonly productName?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameTH?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly productId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class UpdatePopularProductDto implements PopularProductDto {
  @ApiPropertyOptional({ enum: PopularProductStatus })
  @IsOptional()
  @IsEnum(PopularProductStatus)
  readonly status?: PopularProductStatus
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() readonly productName?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly productNameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly productId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class PopularProductList extends Paginated {
  @ApiProperty({ type: PopularProduct, isArray: true }) items: PopularProduct[]
}
