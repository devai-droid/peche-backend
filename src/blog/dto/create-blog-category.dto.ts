import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateBlogCategoryDto {
  @ApiProperty() @IsNotEmpty() @IsString() readonly name: string

  @ApiPropertyOptional() @IsOptional() @IsString() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() @IsString() readonly nameTH?: string

  @ApiPropertyOptional() @IsOptional() @IsNumber() readonly sortOrder?: number
  @ApiPropertyOptional() @IsOptional() @IsString() readonly eventCategoryId?: string
}
