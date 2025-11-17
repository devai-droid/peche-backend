import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { DefaultPaginationQuery, SortOrder } from "../../shared/dto/pagination-query.dto"
import { DtoHelper } from "../../shared/helper/dto.helper"
import { UserStatus } from "@root/shared/enum/user"
import { IsOptional } from "class-validator"
import { Role } from "@root/shared/enum/auth"

export class UserQueryDto extends DefaultPaginationQuery {
  @ApiPropertyOptional()
  @IsOptional()
  phoneNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  status?: UserStatus

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  role?: Role

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
