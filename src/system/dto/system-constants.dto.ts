import { ApiProperty } from "@nestjs/swagger"
import { IsEnum } from "class-validator"
import { SystemConstantsKey } from "@root/shared/enum/system"

export interface SystemConstantsDto {
  key?: SystemConstantsKey
  value?: boolean
}

export class CreateOrUpdateSystemConstantsDto implements SystemConstantsDto {
  @ApiProperty({ enum: SystemConstantsKey }) @IsEnum(SystemConstantsKey) readonly key?: SystemConstantsKey
  @ApiProperty() readonly value?: boolean
}
