import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class SiteSocialLinkDto {
  @ApiProperty({ description: "플랫폼 (kakao/naverPlace/googlePlace/instagram/naverBlog/whatsapp/line/wechat/facebook/tiktok/x 등)" })
  @IsString()
  platform: string

  @ApiProperty({ required: false, description: "링크 주소 (wechat 등 QR 모달은 비움)" })
  @IsOptional()
  @IsString()
  url?: string

  @ApiProperty() @IsBoolean() enabled: boolean

  @ApiProperty() @Type(() => Number) @IsNumber() order: number
}

export class UpdateSiteConfigDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() hospitalName?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() baseUrl?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() organizationType?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() telephone?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() addressStreet?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() addressLocality?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() addressRegion?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() addressPostalCode?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() addressCountry?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number

  @ApiProperty({ required: false }) @IsOptional() @IsString() medicalSpecialty?: string

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sameAs?: string[]

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knowsAbout?: string[]

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[]

  @ApiProperty({ required: false }) @IsOptional() @IsString() weekdayHours?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() weekendHours?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() lunchInfo?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() parkingInfo?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() representativeName?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() businessRegistrationNumber?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() displayAddress?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() landmark?: string

  @ApiProperty({ required: false, type: [SiteSocialLinkDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiteSocialLinkDto)
  socialLinks?: SiteSocialLinkDto[]

  @ApiProperty({ required: false, type: [SiteSocialLinkDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiteSocialLinkDto)
  commonSocialLinks?: SiteSocialLinkDto[]

  @ApiProperty({ required: false }) @IsOptional() @IsString() primaryConsultPlatform?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() primaryConsultUrl?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() googlePlaceUrl?: string
  @ApiProperty({ required: false }) @IsOptional() @IsString() naverPlaceUrl?: string
}
