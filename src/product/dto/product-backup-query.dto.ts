import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"
import { IsOptional, IsUUID } from "class-validator"

export class ProductBackupQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly backupBundleId?: string

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
