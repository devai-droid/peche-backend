import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"
import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"

export class QueryBlogDto extends DefaultPaginationQuery {
  @ApiPropertyOptional() @IsOptional() @IsString() readonly lang?: string

  @ApiPropertyOptional() @IsOptional() @IsString() readonly categoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly eventCategoryId?: string

  @ApiProperty({
    default: [SortOrder.DESC],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortOrder: SortOrder[] = [SortOrder.DESC]

  @ApiProperty({
    default: ["publishedAt"],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortBy: Array<string> = ["publishedAt"]
}
