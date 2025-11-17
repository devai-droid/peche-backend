import { ApiPropertyOptional } from "@nestjs/swagger"

export class SmsDtoByAdmin {
  @ApiPropertyOptional() readonly code?: string
  @ApiPropertyOptional() readonly phoneNumber?: string
}
