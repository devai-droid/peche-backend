import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { EquipmentStatus } from "@root/shared/enum/system"
import { Equipment } from "@root/system/entities/equipment.entity"

export interface EquipmentDto {
  status?: EquipmentStatus
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  namJA?: string
  nameTH?: string
  descriptionFirst?: string
  descriptionFirstEN?: string
  descriptionFirstZH?: string
  descriptionFirstZHTW?: string
  descriptionFirstJA?: string
  descriptionFirstTH?: string
  descriptionSecond?: string
  descriptionSecondEN?: string
  descriptionSecondZH?: string
  descriptionSecondZHTW?: string
  descriptionSecondJA?: string
  descriptionSecondTH?: string
  imageId?: string
  order?: number
}

export class CreateEquipmentDto implements EquipmentDto {
  @ApiPropertyOptional({ enum: EquipmentStatus })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  readonly status?: EquipmentStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirst?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstTH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecond?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondTH?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class UpdateEquipmentDto implements EquipmentDto {
  @ApiPropertyOptional({ enum: EquipmentStatus })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  readonly status?: EquipmentStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirst?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionFirstTH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecond?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionSecondTH?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class EquipmentList extends Paginated {
  @ApiProperty({ type: Equipment, isArray: true }) items: Equipment[]
}
