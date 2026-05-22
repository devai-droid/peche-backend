import { ApiProperty, PartialType } from "@nestjs/swagger"
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator"
import { Type } from "class-transformer"
import { IsInt, Min, Max } from "class-validator"

export class CreateBlogKeywordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  keyword: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ required: false, description: "FK public.product_category(id)" })
  @IsOptional()
  @IsUUID()
  productCategoryId?: string
}

export class UpdateBlogKeywordDto extends PartialType(CreateBlogKeywordDto) {}

export class QueryBlogKeywordDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  productCategoryId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiProperty({ required: false, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50
}
