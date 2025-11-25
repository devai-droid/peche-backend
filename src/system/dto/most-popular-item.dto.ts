import { ApiPropertyOptional } from "@nestjs/swagger"

export class CreateMostPopularItemDto {
  @ApiPropertyOptional()
  categoryId?: string

  @ApiPropertyOptional()
  imageId?: string

  @ApiPropertyOptional() title?: string
  @ApiPropertyOptional() titleEN?: string
  @ApiPropertyOptional() titleZH?: string
  @ApiPropertyOptional() titleZHTW?: string
  @ApiPropertyOptional() titleJA?: string
  @ApiPropertyOptional() titleTH?: string

  @ApiPropertyOptional()
  productDetailPageId?: string

  @ApiPropertyOptional()
  order?: number
}

export class UpdateMostPopularItemDto extends CreateMostPopularItemDto {}
