import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import { ReservationStatus } from "@root/shared/enum/reservation"
import { Building } from "@root/shared/enum/category"
import { Transform } from "class-transformer"
import { DtoHelper } from "@root/shared/helper/dto.helper"

export interface ReservationDto {
  datetime: Date
  status?: ReservationStatus
  productIds?: string[]
  eventIds?: string[]
  userMemo?: string
  adminMemo?: string
  pathVisit?: string
  detailVisit?: string
}

export class CreateReservationDto implements ReservationDto {
  @ApiProperty() datetime: Date
  @ApiPropertyOptional({ enum: ReservationStatus }) @IsOptional() status?: ReservationStatus
  @ApiPropertyOptional() @IsOptional() readonly productIds?: string[]
  @ApiPropertyOptional() @IsOptional() readonly eventIds?: string[]
  @ApiPropertyOptional() @IsOptional() readonly userMemo?: string
  @ApiPropertyOptional() @IsOptional() readonly adminMemo?: string
  @ApiPropertyOptional() @IsOptional() readonly pathVisit?: string
  @ApiPropertyOptional() @IsOptional() readonly detailVisit?: string
}

export class UpdateReservationDto implements ReservationDto {
  @ApiPropertyOptional() @IsOptional() datetime: Date
  @ApiPropertyOptional({ enum: ReservationStatus }) @IsOptional() readonly status?: ReservationStatus
  @ApiPropertyOptional() @IsOptional() readonly userMemo?: string
  @ApiPropertyOptional() @IsOptional() readonly adminMemo?: string
  @ApiPropertyOptional() @IsOptional() readonly pathVisit?: string
  @ApiPropertyOptional() @IsOptional() readonly detailVisit?: string
}

export class ReservationList extends Paginated {
  @ApiProperty({ type: Reservation, isArray: true }) items: Reservation[]
}

export interface AvailableReservationDto {
  productIds?: string[]
  eventIds?: string[]
}

export class AvailableReservationByMonthDto implements AvailableReservationDto {
  @ApiProperty() year: number
  @ApiProperty() month: number
  @ApiPropertyOptional() @IsOptional() @Transform(DtoHelper.explodeParamValue) productIds?: string[]
  @ApiPropertyOptional() @IsOptional() @Transform(DtoHelper.explodeParamValue) eventIds?: string[]
}

export class AvailableReservationByDayDto implements AvailableReservationDto {
  @ApiProperty() year: number
  @ApiProperty() month: number
  @ApiProperty() day: number
  @ApiPropertyOptional() @IsOptional() @Transform(DtoHelper.explodeParamValue) productIds?: string[]
  @ApiPropertyOptional() @IsOptional() @Transform(DtoHelper.explodeParamValue) eventIds?: string[]
}

export class AvailableReservationResultDto {
  @ApiProperty() datetime: Date
  @ApiProperty() building: Building
}

export class ReservationCountByMonthDto {
  @ApiProperty() year: number
  @ApiProperty() month: number
}

export class ReservationCountByDatetimeResultDto {
  @ApiProperty() datetime: Date
  @ApiProperty() building: Building
  @ApiProperty() reservationCount: number
  @ApiProperty() waitingReservationCount: number
  @ApiProperty() maxSlot: number
}

export class ReservationCountByDayResultDto {
  @ApiProperty() day: number
  @ApiProperty({ type: ReservationCountByDatetimeResultDto, isArray: true })
  slots: ReservationCountByDatetimeResultDto[]
  @ApiProperty() isClosed: boolean
}

export class SmartDoctorReservationCountDto {
  @ApiProperty() reservationDate: string
  @ApiProperty() reservationTime: string
  @ApiProperty() count: number
}
