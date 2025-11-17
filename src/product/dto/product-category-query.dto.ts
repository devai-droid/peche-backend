import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { ProductCategoryStatus } from "@root/shared/enum/product"
import { IsOptional } from "class-validator"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"

export class ProductCategoryQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional({ enum: ProductCategoryStatus }) @IsOptional() readonly status?: ProductCategoryStatus

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
