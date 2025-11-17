import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsEmail, IsMobilePhone } from "class-validator"

export class AuthSignInDto {
  @ApiProperty() @IsDefined() email: string
  @ApiProperty() @IsDefined() password: string
}

export class SocialAuthDto {
  @ApiProperty() @IsDefined() idToken: string
}

export class CodeAuthByPhoneDto {
  @ApiProperty() @IsDefined() name: string
  @ApiProperty() @IsDefined() phoneNumber: string
  @ApiProperty() @IsDefined() code: string
}

export class CodeAuthByEmailDto {
  @ApiProperty() @IsDefined() name: string
  @ApiProperty() @IsDefined() email: string
  @ApiProperty() @IsDefined() code: string
}

export class CreatePhoneCodeDto {
  @IsDefined()
  @IsMobilePhone()
  @ApiProperty()
  phoneNumber: string
}

export class CreateEmailCodeDto {
  @IsDefined()
  @ApiProperty()
  @IsEmail()
  email: string
}

export interface AuthFactor {
  phoneNumber?: string
  email?: string
}
