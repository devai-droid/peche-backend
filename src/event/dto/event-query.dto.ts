import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsUUID } from "class-validator"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"

export class EventQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly bundleId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly categoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly detailPageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly integratedCrmCategoryId?: string
  @ApiPropertyOptional() @IsOptional() readonly visible?: boolean
  @ApiPropertyOptional() @IsOptional() readonly visibleEN?: boolean
  @ApiPropertyOptional() @IsOptional() readonly visibleZH?: boolean
  @ApiPropertyOptional() @IsOptional() readonly visibleZHTW?: boolean
  @ApiPropertyOptional() @IsOptional() readonly visibleJA?: boolean
  @ApiPropertyOptional() @IsOptional() readonly visibleTH?: boolean
  @ApiPropertyOptional() @IsOptional() readonly detailPageShow?: boolean

  @ApiProperty({
    default: [SortOrder.DESC],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortOrder: SortOrder[] = [SortOrder.DESC]

  @ApiProperty({
    default: ["createdAt"],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortBy: Array<string> = ["createdAt"]
}
