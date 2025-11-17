import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsDefined, IsEmail, MinLength } from "class-validator"
import { AuthProvider, LanguageLocale } from "../../shared/enum/auth"

export interface SignUpDto {
  phoneNumber?: string
  email?: string
  name?: string
  languageLocale?: LanguageLocale
  marketingAccepted?: boolean
  provider?: AuthProvider
  providerSub?: string
}

export class AuthSignUpDto implements SignUpDto {
  @IsDefined()
  @IsEmail()
  @ApiProperty()
  email: string
  @IsDefined()
  @MinLength(8, { message: "8자 이상이어야 합니다." })
  @ApiProperty()
  password: string
  @ApiPropertyOptional()
  marketingAccepted?: boolean
  @ApiPropertyOptional()
  name?: string
}

export class AuthTokenResponse {
  @ApiProperty()
  token: string
  @ApiProperty()
  justJoined: boolean

  constructor(token: string, justJoined: boolean) {
    this.token = token
    this.justJoined = justJoined
  }
}
