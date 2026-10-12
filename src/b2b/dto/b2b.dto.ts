import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator"
import { ReservationItemSnapshot } from "@root/reservation/entities/reservation.entity"
import { ReservationStatus } from "@root/shared/enum/reservation"

// ── 직원 인증 ──────────────────────────────

export class B2bRequestCodeDto {
  @ApiProperty() @IsEmail() @MaxLength(200) email: string
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(50) name: string
  @ApiProperty({ description: "휴대폰 번호(010-0000-0000)" }) @IsString() @IsNotEmpty() @MaxLength(20) phone: string
}

export class B2bVerifyDto extends B2bRequestCodeDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(10) code: string
}

// 예약확인(조회·변경·취소)용 인증: 회사 이메일만 받는다
export class B2bLookupCodeDto {
  @ApiProperty() @IsEmail() @MaxLength(200) email: string
}

export class B2bLookupVerifyDto extends B2bLookupCodeDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(10) code: string
}

export class B2bLookupVerifyResponse {
  @ApiProperty({ description: "예약확인용 토큰(30분). 본인 예약 조회·변경·취소에만 쓴다" }) token: string
  @ApiProperty() expiresAt: Date
}

export class B2bVerifyResponse {
  @ApiProperty({ description: "예약 1건용 토큰(30분)" }) token: string
  @ApiProperty() expiresAt: Date
  @ApiProperty() companyName: string
  @ApiProperty() name: string
}

// ── 협약사 관리(어드민) ────────────────────

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export class CreateB2bCompanyDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(100) name: string
  @ApiProperty({ type: [String], description: "회사 이메일 도메인. 예: samsung.com" })
  @IsArray()
  @IsString({ each: true })
  emailDomains: string[]
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsNumber() @Min(0) @Max(100) discountRate?: number | null
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(200) discountNote?: string | null
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @Matches(DATE_PATTERN) contractStart?: string | null
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @Matches(DATE_PATTERN) contractEnd?: string | null
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() memo?: string | null
}

export class UpdateB2bCompanyDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(100) name?: string
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) emailDomains?: string[]
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsNumber() @Min(0) @Max(100) discountRate?: number | null
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(200) discountNote?: string | null
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @Matches(DATE_PATTERN) contractStart?: string | null
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @Matches(DATE_PATTERN) contractEnd?: string | null
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() memo?: string | null
}

// ── B2B 예약 이력(어드민) ──────────────────

export class B2bReservationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() companyId?: string
  @ApiPropertyOptional({ description: "이메일 부분 검색" }) @IsOptional() @IsString() email?: string
  @ApiPropertyOptional({ description: "예약 접수일 시작(YYYY-MM-DD)" })
  @IsOptional()
  @Matches(DATE_PATTERN)
  from?: string
  @ApiPropertyOptional({ description: "예약 접수일 끝(YYYY-MM-DD, 포함)" })
  @IsOptional()
  @Matches(DATE_PATTERN)
  to?: string
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1
  @ApiPropertyOptional({ default: 50 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) limit?: number = 50
}

export class B2bReservationRow {
  @ApiProperty() id: string
  @ApiProperty() createdAt: Date
  @ApiProperty() reservationId: string
  @ApiProperty() companyId: string
  @ApiProperty() companyName: string
  @ApiPropertyOptional({ nullable: true }) discountRate?: number | null
  @ApiPropertyOptional({ nullable: true }) discountNote?: string | null
  @ApiProperty() email: string
  @ApiProperty() name: string
  @ApiProperty() phone: string
  @ApiPropertyOptional({ description: "예약 일시" }) datetime?: Date
  @ApiPropertyOptional({ enum: ReservationStatus }) status?: ReservationStatus
  @ApiPropertyOptional({ description: "예약 당시 시술(상품+이벤트) 스냅샷" }) items?: ReservationItemSnapshot[]
}

export class B2bReservationList {
  @ApiProperty({ type: B2bReservationRow, isArray: true }) items: B2bReservationRow[]
  @ApiProperty() total: number
  @ApiProperty() page: number
  @ApiProperty() limit: number
}

// ── B2B 사이트 안내 문구 ───────────────────

export class B2bNoticeDto {
  @ApiPropertyOptional({ nullable: true, description: "예약 화면 안내 문구. 비우면 사이트에 표시하지 않음" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reservationNotice?: string | null
}
