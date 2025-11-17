import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { Event } from "@root/event/entities/event.entity"
import { EventLabel } from "@root/shared/enum/event"

export interface EventDto {
  categoryId?: string
  detailPageId?: string
  integratedCrmCategoryId?: string
  bundleId?: string
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
  price?: number
  discountPrice?: number
  order?: number
  orderEN?: number
  orderZH?: number
  orderZHTW?: number
  orderJA?: number
  orderTH?: number
  visible?: boolean
  visibleEN?: boolean
  visibleZH?: boolean
  visibleZHTW?: boolean
  visibleJA?: boolean
  visibleTH?: boolean
  label?: EventLabel[]
  detailPageShow?: boolean
}

export class CreateEventDto implements EventDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly categoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly detailPageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly integratedCrmCategoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly bundleId?: string
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
  @ApiProperty() price?: number
  @ApiPropertyOptional() @IsOptional() discountPrice?: number
  @ApiPropertyOptional() @IsOptional() order?: number
  @ApiPropertyOptional() @IsOptional() orderEN?: number
  @ApiPropertyOptional() @IsOptional() orderZH?: number
  @ApiPropertyOptional() @IsOptional() orderZHTW?: number
  @ApiPropertyOptional() @IsOptional() orderJA?: number
  @ApiPropertyOptional() @IsOptional() orderTH?: number
  @ApiPropertyOptional() @IsOptional() visible?: boolean
  @ApiPropertyOptional() @IsOptional() visibleEN?: boolean
  @ApiPropertyOptional() @IsOptional() visibleZH?: boolean
  @ApiPropertyOptional() @IsOptional() visibleZHTW?: boolean
  @ApiPropertyOptional() @IsOptional() visibleJA?: boolean
  @ApiPropertyOptional() @IsOptional() visibleTH?: boolean
  @ApiPropertyOptional({ enum: EventLabel, isArray: true }) @IsOptional() readonly label?: EventLabel[]
  @ApiPropertyOptional() @IsOptional() detailPageShow?: boolean
}

export class UpdateEventDto implements EventDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly categoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly detailPageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly integratedCrmCategoryId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly bundleId?: string
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
  @ApiProperty() price?: number
  @ApiPropertyOptional() @IsOptional() discountPrice?: number
  @ApiPropertyOptional() @IsOptional() order?: number
  @ApiPropertyOptional() @IsOptional() orderEN?: number
  @ApiPropertyOptional() @IsOptional() orderZH?: number
  @ApiPropertyOptional() @IsOptional() orderZHTW?: number
  @ApiPropertyOptional() @IsOptional() orderJA?: number
  @ApiPropertyOptional() @IsOptional() orderTH?: number
  @ApiPropertyOptional() @IsOptional() visible?: boolean
  @ApiPropertyOptional() @IsOptional() visibleEN?: boolean
  @ApiPropertyOptional() @IsOptional() visibleZH?: boolean
  @ApiPropertyOptional() @IsOptional() visibleZHTW?: boolean
  @ApiPropertyOptional() @IsOptional() visibleJA?: boolean
  @ApiPropertyOptional() @IsOptional() visibleTH?: boolean
  @ApiPropertyOptional({ enum: EventLabel, isArray: true }) @IsOptional() readonly label?: EventLabel[]
  @ApiPropertyOptional() @IsOptional() detailPageShow?: boolean
}

export class EventList extends Paginated {
  @ApiProperty({ type: Event, isArray: true }) items: Event[]
}

export class CreateEventFromGoogleSpreadsheetDto {
  visible?: boolean
  visibleEN?: boolean
  visibleZH?: boolean
  visibleZHTW?: boolean
  visibleJA?: boolean
  visibleTH?: boolean
  categoryName?: string
  detailPageName?: string
  integratedCrmCategoryName?: string
  bundleId?: string
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
  price?: number
  discountPrice?: number
  order?: number
  orderEN?: number
  orderZH?: number
  orderZHTW?: number
  orderJA?: number
  orderTH?: number
  label?: EventLabel[]
  @ApiPropertyOptional() @IsOptional() detailPageShow?: boolean
}

export class ImportFromGoogleSpreadsheetEventDto {
  @ApiProperty() url?: string
  @ApiProperty() @IsUUID() readonly bundleId?: string
}
