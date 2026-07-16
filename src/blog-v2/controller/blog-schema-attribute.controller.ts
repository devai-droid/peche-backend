import { Body, Controller, Get, Post } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { BlogSchemaAttributeService } from "@root/blog-v2/services/blog-schema-attribute.service"

@Controller("blog-v2/schema-attributes")
@ApiTags("blog-v2/schema-attributes")
export class BlogSchemaAttributeController {
  constructor(private readonly service: BlogSchemaAttributeService) {}

  @ApiOperation({ summary: "스키마 속성 마스터 전체 조회 (어드민)" })
  @Get()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  findAll() {
    return this.service.findAll()
  }

  @ApiOperation({ summary: "스키마 속성 양식 업로드(수정) 이력 — 최근순 (어드민)" })
  @Get("history")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  findHistory() {
    return this.service.findHistory()
  }

  @ApiOperation({
    summary:
      "스키마 속성 양식(md) 전체 동기화 — md가 원본. md에 있으면 등록/갱신, 없으면 삭제. 사이트에 없는 이름은 unmatched로 보고.",
  })
  @Post("sync-md")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  syncMd(@Body("md") md: string, @AuthUser() user: User) {
    return this.service.syncFromMarkdown(md ?? "", user?.email ?? user?.id)
  }
}
