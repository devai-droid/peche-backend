import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { AuthGuard } from "@nestjs/passport"

import { UserService } from "../service/user.service"
import { UpdateUserDto } from "../dto/user.dto"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "../../shared/constant/auth"
import { Auth, AuthUser } from "../../shared/decorator/auth-user.decorator"
import { User } from "../../shared/interface/user"
import { Role } from "../../shared/enum/auth"
import { AccountUser } from "@root/users/entities/user.entity"

@Controller("users")
@ApiTags("users")
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @ApiOkResponse({ type: AccountUser })
  @Get("me")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.USER)
  async findMe(@AuthUser() user?: User) {
    return this.usersService.findMe(user?.id)
  }

  @Put("me")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.USER)
  async updateMine(@AuthUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto, user)
  }

  @ApiOkResponse({ type: AccountUser })
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id)
  }

  @ApiOkResponse({ type: AccountUser })
  @Delete("delete-account")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.USER)
  async deleteAccount(@AuthUser() user: User) {
    return this.usersService.deleteAccount(user.id, user)
  }
}
