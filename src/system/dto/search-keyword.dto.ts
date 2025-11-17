import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { LanguageLocale } from "@root/shared/enum/auth"
import { SearchKeyword } from "@root/system/entities/search-keyword.entity"

export interface SearchKeywordDto {
  languageLocale?: LanguageLocale
  keyword?: string
  order?: number
}

export class CreateSearchKeywordDto implements SearchKeywordDto {
  @ApiPropertyOptional({ enum: LanguageLocale })
  @IsOptional()
  @IsEnum(LanguageLocale)
  readonly languageLocale?: LanguageLocale
  @ApiProperty() readonly keyword: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class UpdateSearchKeywordDto implements SearchKeywordDto {
  @ApiPropertyOptional({ enum: LanguageLocale })
  @IsOptional()
  @IsEnum(LanguageLocale)
  readonly languageLocale?: LanguageLocale
  @ApiPropertyOptional() @IsOptional() readonly keyword?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class SearchKeywordList extends Paginated {
  @ApiProperty({ type: SearchKeyword, isArray: true }) items: SearchKeyword[]
}
