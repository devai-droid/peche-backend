import { MainImageStatus } from "@root/shared/enum/system"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { MainImage } from "@root/system/entities/main-image.entity"

export interface MainImageDto {
  status?: MainImageStatus
  description?: string
  imageId?: string
  order?: number
}

export class CreateMainImageDto implements MainImageDto {
  @ApiPropertyOptional({ enum: MainImageStatus })
  @IsOptional()
  @IsEnum(MainImageStatus)
  readonly status?: MainImageStatus
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class UpdateMainImageDto implements MainImageDto {
  @ApiPropertyOptional({ enum: MainImageStatus })
  @IsOptional()
  @IsEnum(MainImageStatus)
  readonly status?: MainImageStatus
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class MainImageList extends Paginated {
  @ApiProperty({ type: MainImage, isArray: true }) items: MainImage[]
}
