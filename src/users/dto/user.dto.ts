import { IsEnum, IsMobilePhone, IsOptional, IsUUID } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { AccountUser } from "../entities/user.entity"
import { UserStatus } from "../../shared/enum/user"
import { AuthProvider, LanguageLocale, Role } from "@root/shared/enum/auth"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { Exclude } from "class-transformer"
import { Paginated } from "@root/shared/dto/base-list.ro"

export interface UserDto {
  phoneNumber?: string
  email?: string
  password?: string
  name?: string
  marketingAccepted?: boolean
  description?: string
  profileId?: string
  languageLocale?: LanguageLocale
  provider?: AuthProvider
  providerSub?: string
  status?: UserStatus
  region?: string
}

export class CreateUserDto implements UserDto {
  readonly email?: string
  readonly phoneNumber?: string
  readonly password?: string
  readonly name?: string
  readonly description?: string
  readonly languageLocale?: LanguageLocale
  readonly region?: string
}

export class UpdateUserDto implements UserDto {
  @ApiPropertyOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() @IsMobilePhone() readonly phoneNumber?: string
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() profileId?: string
  @ApiPropertyOptional({ enum: UserStatus }) @IsOptional() @IsEnum(UserStatus) readonly status?: UserStatus
  @ApiPropertyOptional() @IsOptional() readonly marketingAccepted?: boolean
  @ApiPropertyOptional({ enum: LanguageLocale })
  @IsOptional()
  @IsEnum(LanguageLocale)
  readonly languageLocale?: LanguageLocale
  @ApiPropertyOptional() @IsOptional() readonly region?: string
}

export class UserInfo extends TimeStampEntity {
  id: string
  phoneNumber: string
  @Exclude()
  password?: string
  name?: string
  @Exclude()
  provider: AuthProvider
  providerSub?: string
  languageLocale?: LanguageLocale
  status: UserStatus
  region?: string
  marketingAccepted?: boolean
  roles: Role[]
  description?: string
}

export class UserDtoHelper {
  public static toEntity(dto: UserDto, id?: string): AccountUser {
    return Object.assign(new AccountUser(), dto, { phoneNumber: dto.phoneNumber, id: id })
  }
}

export class AccountUserList extends Paginated {
  @ApiProperty({ type: AccountUser, isArray: true }) items: AccountUser[]
}
