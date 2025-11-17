import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { PopularProductStatus } from "@root/shared/enum/system"
import { IsOptional } from "class-validator"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"

export class PopularProductQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional({ enum: PopularProductStatus }) @IsOptional() readonly status?: PopularProductStatus

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
