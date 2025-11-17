import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { Building } from "@root/shared/enum/category"
import { IsOptional } from "class-validator"
import { SpecificDate } from "@root/reservation/entities/specific-date.entity"
import { SpecificDateSlot } from "@root/reservation/entities/specific-date-slot.entity"

export interface SpecificDateDto {
  date?: Date
  memo?: string
  slots?: SpecificDateSlotDto[]
}

export interface SpecificDateSlotDto {
  building: Building
  hour: number
  minutes: number
  maxSlot: number
}

export class CreateSpecificDateSlotDto implements SpecificDateSlotDto {
  @ApiProperty() readonly building: Building
  @ApiProperty() readonly hour: number
  @ApiProperty() readonly minutes: number
  @ApiProperty() readonly maxSlot: number
}

export class CreateSpecificDateDto implements SpecificDateDto {
  @ApiProperty() date: Date
  @ApiPropertyOptional() @IsOptional() memo: string
  @ApiProperty({ type: () => CreateSpecificDateSlotDto, isArray: true }) readonly slots?: SpecificDateSlotDto[]
}

export class UpdateSpecificDateDto implements SpecificDateDto {
  @ApiPropertyOptional() @IsOptional() date: Date
  @ApiPropertyOptional() @IsOptional() memo: string
  @ApiPropertyOptional({ type: () => CreateSpecificDateSlotDto, isArray: true })
  @IsOptional()
  readonly slots?: SpecificDateSlotDto[]
}

export class SpecificDateList extends Paginated {
  @ApiProperty({ type: SpecificDate, isArray: true }) items: SpecificDate[]
}


export class SpecificDateSlotList extends Paginated {
  @ApiProperty({ type: SpecificDateSlot, isArray: true }) items: SpecificDateSlot[]
}

