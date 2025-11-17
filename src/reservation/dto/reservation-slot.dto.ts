import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { Building } from "@root/shared/enum/category"
import { DaysOfWeek } from "@root/shared/enum/reservation"
import { IsOptional } from "class-validator"
import { ReservationSlot } from "@root/reservation/entities/reservation-slot.entity"

export interface ReservationSlotDto {
  building: Building
  dayOfWeek: DaysOfWeek
  hour: number
  minutes: number
  maxSlot: number
}

export class CreateReservationSlotDto implements ReservationSlotDto {
  @ApiProperty() readonly building: Building
  @ApiProperty() readonly dayOfWeek: DaysOfWeek
  @ApiProperty() readonly hour: number
  @ApiProperty() readonly minutes: number
  @ApiProperty() readonly maxSlot: number
}

export class BulkCreateReservationSlotDto {
  @ApiPropertyOptional({ type: CreateReservationSlotDto, isArray: true })
  @IsOptional()
  readonly dto: CreateReservationSlotDto[]
}

export class ReservationSlotList extends Paginated {
  @ApiProperty({ type: ReservationSlot, isArray: true }) items: ReservationSlot[]
}

