import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"
import { IsOptional } from "class-validator"
import { ReservationStatus } from "@root/shared/enum/reservation"
import { Building } from "@root/shared/enum/category"

export class ReservationQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional() @IsOptional() readonly userName?: string
  @ApiPropertyOptional() @IsOptional() readonly userPhoneNumber?: string
  @ApiPropertyOptional() @IsOptional() @Transform(DtoHelper.explodeParamValue) createdAtBetween?: Date[]
  @ApiPropertyOptional() @IsOptional() @Transform(DtoHelper.explodeParamValue) datetimeBetween?: Date[]
  @ApiPropertyOptional() @IsOptional() @Transform(DtoHelper.explodeParamValue) readonly statusIn?: ReservationStatus[]
  @ApiPropertyOptional({ enum: Building }) @IsOptional() readonly building?: Building
  @ApiPropertyOptional() @IsOptional() readonly pathVisit?: string
  @ApiPropertyOptional() @IsOptional() readonly detailVisit?: string
  @ApiPropertyOptional() @IsOptional() readonly userId?: string

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
