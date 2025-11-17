import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { CloseDay } from "@root/reservation/entities/close-day.entity"

export interface CloseDayDto {
  memo?: string
  date?: Date
}

export class CreateCloseDayDto implements CloseDayDto {
  @ApiPropertyOptional() @IsOptional() readonly memo?: string
  @ApiProperty() date?: Date
}

export class UpdateCloseDayDto implements CloseDayDto {
  @ApiPropertyOptional() @IsOptional() readonly memo?: string
  @ApiPropertyOptional() @IsOptional() date?: Date
}

export class CloseDayList extends Paginated {
  @ApiProperty({ type: CloseDay, isArray: true }) items: CloseDay[]
}

