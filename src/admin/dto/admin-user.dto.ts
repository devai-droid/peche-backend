import { LanguageLocale } from "@root/shared/enum/auth"
import { UserDto } from "@root/users/dto/user.dto"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class UserDtoByAdmin implements UserDto {
  @ApiPropertyOptional() readonly email?: string
  @ApiPropertyOptional() readonly phoneNumber?: string
  @ApiPropertyOptional() readonly password?: string
  @ApiPropertyOptional() readonly name?: string
  @ApiPropertyOptional() readonly languageLocale?: LanguageLocale
  @ApiPropertyOptional() readonly description?: string
  @ApiPropertyOptional() readonly region?: string
}
