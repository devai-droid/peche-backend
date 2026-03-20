import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, IsUUID } from "class-validator"
import { Type } from "class-transformer"

export class UpdateBlogPostDto {
  @ApiPropertyOptional() @IsOptional() @IsString() readonly title?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly slug?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly content?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly author?: string

  @ApiPropertyOptional() @IsOptional() @IsString() readonly titleEN?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly titleZH?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly titleZHTW?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly titleJA?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly titleTH?: string

  @ApiPropertyOptional() @IsOptional() @IsString() readonly summary?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly summaryEN?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly summaryZH?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly summaryZHTW?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly summaryJA?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly summaryTH?: string

  @ApiPropertyOptional() @IsOptional() @IsString() readonly contentEN?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly contentZH?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly contentZHTW?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly contentJA?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly contentTH?: string

  @ApiPropertyOptional() @IsOptional() @IsString() readonly keywords?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly eventCategoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly thumbnailUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Type(() => Boolean) readonly visible?: boolean
  @ApiPropertyOptional() @IsOptional() @IsDateString() readonly publishedAt?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  readonly categoryIds?: string[]
}
