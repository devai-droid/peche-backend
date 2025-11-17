import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional } from "class-validator"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"
import { LanguageLocale } from "@root/shared/enum/auth"

export class SearchKeywordQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional({ enum: LanguageLocale }) @IsOptional() readonly languageLocale?: LanguageLocale

  @ApiProperty({
    default: [SortOrder.DESC],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortOrder: SortOrder[] = [SortOrder.ASC]

  @ApiProperty({
    default: ["order"],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortBy: Array<string> = ["order"]
}
