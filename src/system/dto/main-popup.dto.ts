import { MainPopupStatus } from "@root/shared/enum/system"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { MainPopup, PopupNoticeItem } from "@root/system/entities/main-popup.entity"

export class PopupNoticeItemDto implements PopupNoticeItem {
  @ApiProperty() @IsString() title: string
  @ApiProperty() @IsString() subtitle: string
}

export interface MainPopupDto {
  status?: MainPopupStatus
  description?: string
  imageId?: string
  imageENId?: string
  imageZHId?: string
  imageZHTWId?: string
  imageJAId?: string
  imageTHId?: string
  noticeItems?: PopupNoticeItem[]
  order?: number
  startDate?: Date | null
  endDate?: Date | null
}

export class CreateMainPopupDto implements MainPopupDto {
  @ApiPropertyOptional({ enum: MainPopupStatus })
  @IsOptional()
  @IsEnum(MainPopupStatus)
  readonly status?: MainPopupStatus
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageENId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHTWId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageJAId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageTHId?: string
  @ApiPropertyOptional({ type: PopupNoticeItemDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PopupNoticeItemDto)
  readonly noticeItems?: PopupNoticeItemDto[]
  @ApiPropertyOptional() @IsOptional() readonly order?: number
  @ApiPropertyOptional() @IsOptional() readonly startDate?: Date | null
  @ApiPropertyOptional() @IsOptional() readonly endDate?: Date | null
}

export class UpdateMainPopupDto implements MainPopupDto {
  @ApiPropertyOptional({ enum: MainPopupStatus })
  @IsOptional()
  @IsEnum(MainPopupStatus)
  readonly status?: MainPopupStatus
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageENId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHTWId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageJAId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageTHId?: string
  @ApiPropertyOptional({ type: PopupNoticeItemDto, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PopupNoticeItemDto)
  readonly noticeItems?: PopupNoticeItemDto[]
  @ApiPropertyOptional() @IsOptional() readonly order?: number
  @ApiPropertyOptional() @IsOptional() readonly startDate?: Date | null
  @ApiPropertyOptional() @IsOptional() readonly endDate?: Date | null
}

export class MainPopupList extends Paginated {
  @ApiProperty({ type: MainPopup, isArray: true }) items: MainPopup[]
}
