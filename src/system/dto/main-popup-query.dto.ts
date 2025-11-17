import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"
import { IsOptional } from "class-validator"
import { MainPopupStatus } from "@root/shared/enum/system"

export class MainPopupQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional({ enum: MainPopupStatus }) @IsOptional() readonly status?: MainPopupStatus

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
