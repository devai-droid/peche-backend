import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { BlogKeywordService } from "@root/blog-v2/services/blog-keyword.service"
import { CreateBlogKeywordDto, QueryBlogKeywordDto, UpdateBlogKeywordDto } from "@root/blog-v2/dto/keyword.dto"

@Controller("blog-v2/keywords")
@ApiTags("blog-v2/keywords")
export class BlogKeywordController {
  constructor(private readonly service: BlogKeywordService) {}

  @ApiOperation({ summary: "키워드 풀 등록 (마스터)" })
  @Post()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  create(@Body() dto: CreateBlogKeywordDto, @AuthUser() user: User) {
    return this.service.create(dto, user)
  }

  @ApiOperation({ summary: "키워드 풀 목록" })
  @Get()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  findMany(@Query() query: QueryBlogKeywordDto) {
    return this.service.findMany(query)
  }

  @ApiOperation({ summary: "키워드 상세" })
  @Get(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOne(id)
  }

  @ApiOperation({ summary: "키워드 수정" })
  @Patch(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateBlogKeywordDto, @AuthUser() user: User) {
    return this.service.update(id, dto, user)
  }

  @ApiOperation({ summary: "키워드 삭제" })
  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.remove(id)
  }
}
