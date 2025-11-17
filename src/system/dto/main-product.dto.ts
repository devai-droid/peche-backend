import { MainProductStatus } from "@root/shared/enum/system"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { MainProduct } from "@root/system/entities/main-product.entity"

export interface MainProductDto {
  status?: MainProductStatus
  description?: string
  imageId?: string
  imageENId?: string
  imageZHId?: string
  imageZHTWId?: string
  imageJAId?: string
  imageTHId?: string
  productId?: string
  order?: number
}

export class CreateMainProductDto implements MainProductDto {
  @ApiPropertyOptional({ enum: MainProductStatus })
  @IsOptional()
  @IsEnum(MainProductStatus)
  readonly status?: MainProductStatus
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageENId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHTWId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageJAId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageTHId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly productId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class UpdateMainProductDto implements MainProductDto {
  @ApiPropertyOptional({ enum: MainProductStatus })
  @IsOptional()
  @IsEnum(MainProductStatus)
  readonly status?: MainProductStatus
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageENId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHTWId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageJAId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageTHId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly productId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class MainProductList extends Paginated {
  @ApiProperty({ type: MainProduct, isArray: true }) items: MainProduct[]
}
