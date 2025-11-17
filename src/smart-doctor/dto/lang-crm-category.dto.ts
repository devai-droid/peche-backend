import { ApiPropertyOptional } from "@nestjs/swagger"
import { Building, LangCategoryStatus } from "@root/shared/enum/category"
import { IsArray, IsEnum, IsOptional, IsUUID } from "class-validator"
import { LanguageLocale } from "@root/shared/enum/auth"

export interface LangCrmCategoryDto {
  lang?: LanguageLocale
  status?: LangCategoryStatus
  name?: string
  building1CrmCategoryId?: string
  building2CrmCategoryId?: string
  building3CrmCategoryId?: string
  buildingPriorities?: Building[]
  order?: number
}

export class CreateLangCrmCategoryDto implements LangCrmCategoryDto {
  @ApiPropertyOptional({ enum: LanguageLocale }) @IsOptional() @IsEnum(LanguageLocale) readonly lang?: LanguageLocale
  @ApiPropertyOptional({ enum: LangCategoryStatus })
  @IsOptional()
  @IsEnum(LangCategoryStatus)
  readonly status?: LangCategoryStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly building1CrmCategoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly building2CrmCategoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly building3CrmCategoryId?: string
  @ApiPropertyOptional({
    enum: Building,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Building, { each: true })
  readonly buildingPriorities?: Building[]
  @ApiPropertyOptional() @IsOptional() order?: number
}

export class UpdateLangCrmCategoryDto implements LangCrmCategoryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() id?: string
  @ApiPropertyOptional({ enum: LanguageLocale }) @IsOptional() @IsEnum(LanguageLocale) readonly lang?: LanguageLocale
  @ApiPropertyOptional({ enum: LangCategoryStatus })
  @IsOptional()
  @IsEnum(LangCategoryStatus)
  readonly status?: LangCategoryStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly building1CrmCategoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly building2CrmCategoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly building3CrmCategoryId?: string
  @ApiPropertyOptional({
    enum: Building,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Building, { each: true })
  readonly buildingPriorities?: Building[]
  @ApiPropertyOptional() @IsOptional() order?: number
}
