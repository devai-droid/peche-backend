import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { CreateMemberDto, MemberList, UpdateMemberDto } from "@root/system/dto/member.dto"
import { MemberService } from "@root/system/service/member.service"
import { MemberQueryDto } from "@root/system/dto/member-query.dto"
import { Member } from "@root/system/entities/member.entity"

@Controller("members")
@ApiTags("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @ApiOkResponse({ type: MemberList })
  @Get("")
  async findMany(@Query() query: MemberQueryDto) {
    return this.memberService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: Member })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateMemberDto) {
    return this.memberService.create(dto)
  }

  @ApiOkResponse({ type: Member })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateMemberDto, @AuthUser() user?: User) {
    return this.memberService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.memberService.remove(id)
  }
}
