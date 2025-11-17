import { CelebMainPageStatus } from "@root/shared/enum/system"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { CelebPictures } from "@root/system/entities/celeb-pictures.entity"

export interface CelebPicturesDto {
  status?: CelebMainPageStatus
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  nameJA?: string
  nameTH?: string
  occupation?: string
  occupationEN?: string
  occupationZH?: string
  occupationZHTW?: string
  occupationJA?: string
  occupationTH?: string
  imageId?: string
  imageENId?: string
  imageZHId?: string
  imageZHTWId?: string
  imageJAId?: string
  imageTHId?: string
  mainPageOrder?: number
  archivePageOrder?: number
}

export class CreateCelebPicturesDto implements CelebPicturesDto {
  @ApiPropertyOptional({ enum: CelebMainPageStatus })
  @IsOptional()
  @IsEnum(CelebMainPageStatus)
  readonly status?: CelebMainPageStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly occupation?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationEN?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationZH?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationJA?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationTH?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageENId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHTWId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageJAId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageTHId?: string
  @ApiPropertyOptional() @IsOptional() readonly mainPageOrder?: number
  @ApiPropertyOptional() @IsOptional() readonly archivePageOrder?: number
}

export class UpdateCelebPicturesDto implements CelebPicturesDto {
  @ApiPropertyOptional({ enum: CelebMainPageStatus })
  @IsOptional()
  @IsEnum(CelebMainPageStatus)
  readonly status?: CelebMainPageStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly occupation?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationEN?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationZH?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationJA?: string
  @ApiPropertyOptional() @IsOptional() readonly occupationTH?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageENId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageZHTWId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageJAId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageTHId?: string
  @ApiPropertyOptional() @IsOptional() readonly mainPageOrder?: number
  @ApiPropertyOptional() @IsOptional() readonly archivePageOrder?: number
}

export class CelebPicturesList extends Paginated {
  @ApiProperty({ type: CelebPictures, isArray: true }) items: CelebPictures[]
}
