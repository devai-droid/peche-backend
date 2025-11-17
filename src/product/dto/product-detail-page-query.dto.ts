import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { ProductDetailPageStatus } from "@root/shared/enum/product"
import { IsOptional, IsUUID } from "class-validator"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"

export class ProductDetailPageQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly categoryId?: string
  @ApiPropertyOptional({ enum: ProductDetailPageStatus }) @IsOptional() readonly status?: ProductDetailPageStatus

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
