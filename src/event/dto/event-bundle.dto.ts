import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsDate, IsOptional } from "class-validator"
import { Type } from "class-transformer"
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
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() postStartDate?: Date
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() postEndDate?: Date
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() startDate?: Date
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() endDate?: Date
  @ApiPropertyOptional() @IsOptional() visibleFirst?: boolean
  @ApiPropertyOptional() @IsOptional() visibleSecond?: boolean
}

export class EventBundleList extends Paginated {
  @ApiProperty({ type: EventBundle, isArray: true }) items: EventBundle[]
}
