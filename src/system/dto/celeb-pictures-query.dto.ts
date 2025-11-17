import { DefaultPaginationQuery, SortOrder } from "@root/shared/dto/pagination-query.dto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { CelebMainPageStatus } from "@root/shared/enum/system"
import { IsOptional } from "class-validator"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"

export class CelebPicturesQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional({ enum: CelebMainPageStatus })
  @IsOptional()
  readonly status?: CelebMainPageStatus

  @ApiProperty({
    default: [SortOrder.ASC],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortOrder: SortOrder[] = [SortOrder.ASC]

  @ApiProperty({
    default: ["mainPageOrder"],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortBy: Array<string> = ["mainPageOrder"]
}
