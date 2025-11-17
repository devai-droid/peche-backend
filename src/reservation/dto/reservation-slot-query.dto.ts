import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"
import { IsOptional } from "class-validator"
import { DaysOfWeek } from "@root/shared/enum/reservation"
import { Building } from "@root/shared/enum/category"

export class ReservationSlotQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional({ enum: Building }) @IsOptional() readonly building?: Building
  @ApiPropertyOptional({ enum: DaysOfWeek }) @IsOptional() readonly dayOfWeek?: DaysOfWeek

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
