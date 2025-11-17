import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { UserDtoByAdmin } from "@root/admin/dto/admin-user.dto"
import { UserService } from "@root/users/service/user.service"
import { ApiResponse } from "@nestjs/swagger"
import { AccountUser } from "@root/users/entities/user.entity"
import { UserQueryDto } from "@root/users/dto/user-query.dto"
import { AccountUserList } from "@root/users/dto/user.dto"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"

@Controller("admin/users")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiResponse({ type: AccountUser })
  async createUser(@Body() dto: UserDtoByAdmin) {
    return await this.userService.create(dto)
  }

  @Get()
  @ApiResponse({ type: AccountUserList })
  async findUsers(@Query() query: UserQueryDto) {
    return await this.userService.findManyWithPaginationQuery(query)
  }

  @Get(":id")
  @ApiResponse({ type: AccountUser })
  async findOneUser(@Param("id", ParseUUIDPipe) id: string) {
    return await this.userService.findOne(id)
  }

  @Put(":id")
  @ApiResponse({ type: AccountUser })
  async updateUser(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UserDtoByAdmin) {
    const user = await this.userService.update(id, Object.assign({}, { ...dto }, { password: undefined }))
    if (dto.password) {
      await this.userService.updatePassword(id, dto.password)
    }
    return user
  }

  @Put(":id/admin")
  @ApiResponse({ type: AccountUser })
  async setAdmin(@Param("id", ParseUUIDPipe) id: string) {
    return await this.userService.updateAdmin(id)
  }

  @Delete(":id/admin")
  @ApiResponse({ type: AccountUser })
  async removeAdmin(@Param("id", ParseUUIDPipe) id: string) {
    return await this.userService.removeAdmin(id)
  }
}
