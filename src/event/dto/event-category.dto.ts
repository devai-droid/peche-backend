import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { EventCategory } from "@root/event/entities/event-category.entity"
import { EventCategoryStatus } from "@root/shared/enum/event"

export interface EventCategoryDto {
  status?: EventCategoryStatus
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  nameJA?: string
  nameTH?: string
  description?: string
  descriptionEN?: string
  descriptionZH?: string
  descriptionZHTW?: string
  descriptionJA?: string
  descriptionTH?: string
  startDate?: Date
  endDate?: Date
  dayOfWeek?: number[]
  startHour?: number
  startMinute?: number
  endHour?: number
  endMinute?: number
  order?: number
}

export class CreateEventCategoryDto implements EventCategoryDto {
  @ApiPropertyOptional({ enum: EventCategoryStatus })
  @IsOptional()
  @IsEnum(EventCategoryStatus)
  readonly status?: EventCategoryStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionTH?: string
  @ApiPropertyOptional() @IsOptional() startDate?: Date
  @ApiPropertyOptional() @IsOptional() endDate?: Date
  @ApiPropertyOptional() @IsOptional() dayOfWeek?: number[]
  @ApiPropertyOptional() @IsOptional() startHour?: number
  @ApiPropertyOptional() @IsOptional() startMinute?: number
  @ApiPropertyOptional() @IsOptional() endHour?: number
  @ApiPropertyOptional() @IsOptional() endMinute?: number
  @ApiPropertyOptional() @IsOptional() order?: number
}

export class UpdateEventCategoryDto implements EventCategoryDto {
  @ApiPropertyOptional({ enum: EventCategoryStatus })
  @IsOptional()
  @IsEnum(EventCategoryStatus)
  readonly status?: EventCategoryStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionTH?: string
  @ApiPropertyOptional() @IsOptional() startDate?: Date
  @ApiPropertyOptional() @IsOptional() endDate?: Date
  @ApiPropertyOptional() @IsOptional() dayOfWeek?: number[]
  @ApiPropertyOptional() @IsOptional() startHour?: number
  @ApiPropertyOptional() @IsOptional() startMinute?: number
  @ApiPropertyOptional() @IsOptional() endHour?: number
  @ApiPropertyOptional() @IsOptional() endMinute?: number
  @ApiPropertyOptional() @IsOptional() order?: number
}

export class EventCategoryList extends Paginated {
  @ApiProperty({ type: EventCategory, isArray: true }) items: EventCategory[]
}
