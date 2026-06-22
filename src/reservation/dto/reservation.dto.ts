import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsObject, IsOptional } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import { ReservationCategory, ReservationStatus } from "@root/shared/enum/reservation"
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
  palettePlanId?: string
  category?: ReservationCategory
  quantities?: Record<string, number>
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
  // 홈페이지 예약 분류(A 초진 / B 재진 보유권 / C 제모 보유권) → 닥터팔레트 스케줄 라우팅
  @ApiPropertyOptional({ enum: ReservationCategory })
  @IsOptional()
  readonly category?: ReservationCategory
  // 시술별 수량 { [productOrEventId]: 개수 } — 닥팔 예약메모 단가·소계 계산용
  @ApiPropertyOptional({ type: "object", additionalProperties: { type: "number" } })
  @IsOptional()
  @IsObject()
  readonly quantities?: Record<string, number>
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
  // 분류별 스케줄 슬롯 조회 (미지정 시 초진 스케줄)
  @ApiPropertyOptional({ enum: ReservationCategory }) @IsOptional() category?: ReservationCategory
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
