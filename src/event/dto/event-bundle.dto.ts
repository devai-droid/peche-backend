import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { EventBundle } from "@root/event/entities/event-bundle.entity"

export interface EventBundleDto {
  name?: string
}

export class CreateEventBundleDto implements EventBundleDto {
  @ApiPropertyOptional() @IsOptional() readonly name?: string
}

export class UpdateEventBundleDto implements EventBundleDto {
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() postStartDate?: Date
  @ApiPropertyOptional() @IsOptional() postEndDate?: Date
  @ApiPropertyOptional() @IsOptional() startDate?: Date
  @ApiPropertyOptional() @IsOptional() endDate?: Date
  @ApiPropertyOptional() @IsOptional() visibleFirst?: boolean
  @ApiPropertyOptional() @IsOptional() visibleSecond?: boolean
}

export class EventBundleList extends Paginated {
  @ApiProperty({ type: EventBundle, isArray: true }) items: EventBundle[]
}
