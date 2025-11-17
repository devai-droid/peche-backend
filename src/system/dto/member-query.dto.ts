import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { MemberOccupation, MemberStatus } from "@root/shared/enum/system"
import { IsOptional } from "class-validator"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"

export class MemberQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional({ enum: MemberStatus }) @IsOptional() readonly status?: MemberStatus
  @ApiPropertyOptional({ enum: MemberOccupation }) @IsOptional() readonly occupation?: MemberOccupation

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
