import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional } from "class-validator"

export class SearchQueryDto {
  @ApiPropertyOptional() @IsOptional() readonly query?: string
}
