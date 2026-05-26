import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator"
import { Type } from "class-transformer"

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
}
