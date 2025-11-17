import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional } from "class-validator"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"
import { EventCategoryStatus } from "@root/shared/enum/event"

export class EventCategoryQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional({ enum: EventCategoryStatus }) @IsOptional() readonly status?: EventCategoryStatus

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
