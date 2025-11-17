import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsEmail, IsMobilePhone, IsNotEmpty, MinLength } from "class-validator"
import { VerificationType } from "@root/auth/entities/verification-code.entity"

export interface VerificationDto {
  email: string
}

export class CreateVerificationDto implements VerificationDto {
  @ApiProperty()
  @IsMobilePhone()
  readonly email: string
  @ApiProperty({ enum: VerificationType }) type: VerificationType
}

export class PasswordResetDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string
  @ApiProperty()
  @IsNotEmpty()
  readonly code: string
  @IsDefined()
  @MinLength(8, { message: "8자 이상이어야 합니다." })
  @ApiProperty()
  password: string
  @ApiProperty({ enum: VerificationType }) type: VerificationType
}

export class VerifiedCode {
  @ApiProperty()
  email: string
  @ApiProperty()
  verified: boolean
}
