import { ApiPropertyOptional } from "@nestjs/swagger"
import { Building } from "@root/shared/enum/category"
import { IsEnum, IsOptional } from "class-validator"

export interface IntegratedCrmCategoryDto {
  name?: string
  building1CrmCategoryCode?: string
  building2CrmCategoryCode?: string
  building3CrmCategoryCode?: string
  firstPriorityBuilding?: Building
  secondPriorityBuilding?: Building
  order?: number
}

export class CreateIntegratedCrmCategoryDto implements IntegratedCrmCategoryDto {
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly building1CrmCategoryCode?: string
  @ApiPropertyOptional() @IsOptional() readonly building2CrmCategoryCode?: string
  @ApiPropertyOptional() @IsOptional() readonly building3CrmCategoryCode?: string
  @ApiPropertyOptional({ enum: Building }) @IsOptional() @IsEnum(Building) readonly firstPriorityBuilding?: Building
  @ApiPropertyOptional({ enum: Building }) @IsOptional() @IsEnum(Building) readonly secondPriorityBuilding?: Building
  @ApiPropertyOptional() @IsOptional() order?: number
}

export class UpdateIntegratedCrmCategoryDto implements IntegratedCrmCategoryDto {
  @ApiPropertyOptional() @IsOptional() id?: string
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly building1CrmCategoryCode?: string
  @ApiPropertyOptional() @IsOptional() readonly building2CrmCategoryCode?: string
  @ApiPropertyOptional() @IsOptional() readonly building3CrmCategoryCode?: string
  @ApiPropertyOptional({ enum: Building }) @IsOptional() @IsEnum(Building) readonly firstPriorityBuilding?: Building
  @ApiPropertyOptional({ enum: Building }) @IsOptional() @IsEnum(Building) readonly secondPriorityBuilding?: Building
  @ApiPropertyOptional() @IsOptional() order?: number
}
