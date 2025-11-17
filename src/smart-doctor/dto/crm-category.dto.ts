import { ApiPropertyOptional } from "@nestjs/swagger"

export class UpdateCrmCategoryDto {
  @ApiPropertyOptional() readonly maxSlot?: number
}
