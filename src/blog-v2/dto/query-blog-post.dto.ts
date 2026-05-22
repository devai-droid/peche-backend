import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator"
import { Type } from "class-transformer"
import { BlogPostLang, BlogPostStatus } from "@root/blog-v2/enum/blog-v2.enum"

export class QueryBlogPostDto {
  @ApiProperty({ required: false, enum: BlogPostStatus })
  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus

  @ApiProperty({ required: false, enum: BlogPostLang })
  @IsOptional()
  @IsEnum(BlogPostLang)
  lang?: BlogPostLang

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  productCategoryId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  keywordId?: string

  @ApiProperty({ required: false, description: "상세페이지명 정확 일치 (product_page)" })
  @IsOptional()
  @IsString()
  productPage?: string

  @ApiProperty({ required: false, description: "상세페이지명 부분 일치 (product_page ILIKE)" })
  @IsOptional()
  @IsString()
  productPageContains?: string

  @ApiProperty({ required: false, description: "제목·요약·본문 검색" })
  @IsOptional()
  @IsString()
  q?: string

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}
