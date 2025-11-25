import { ApiPropertyOptional } from "@nestjs/swagger"

export class CreateMostPopularCategoryDto {
  @ApiPropertyOptional()
  status?: "ACTIVE" | "INACTIVE"

  @ApiPropertyOptional() name?: string
  @ApiPropertyOptional() nameEN?: string
  @ApiPropertyOptional() nameZH?: string
  @ApiPropertyOptional() nameZHTW?: string
  @ApiPropertyOptional() nameJA?: string
  @ApiPropertyOptional() nameTH?: string

  @ApiPropertyOptional({ type: [String] }) keywords?: string[]
  @ApiPropertyOptional({ type: [String] }) keywordsEN?: string[]
  @ApiPropertyOptional({ type: [String] }) keywordsZH?: string[]
  @ApiPropertyOptional({ type: [String] }) keywordsZHTW?: string[]
  @ApiPropertyOptional({ type: [String] }) keywordsJA?: string[]
  @ApiPropertyOptional({ type: [String] }) keywordsTH?: string[]

  @ApiPropertyOptional()
  order?: number
}

export class UpdateMostPopularCategoryDto extends CreateMostPopularCategoryDto {}
