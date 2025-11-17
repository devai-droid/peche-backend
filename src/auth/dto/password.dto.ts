import { ApiProperty } from "@nestjs/swagger"
import { MinLength } from "class-validator"

export class PasswordChangeDto {
  @ApiProperty() oldPassword: string
  @ApiProperty() @MinLength(8, { message: "8자 이상이어야 합니다." }) newPassword: string
}
