import { Body, Controller, Get, Put } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { BlogSiteConfigService } from "@root/blog-v2/services/blog-site-config.service"
import { UpdateSiteConfigDto } from "@root/blog-v2/dto/site-config.dto"

@Controller("blog-v2/site-config")
@ApiTags("blog-v2/site-config")
export class BlogSiteConfigController {
  constructor(private readonly service: BlogSiteConfigService) {}

  @ApiOperation({ summary: "사이트 공통 정보 공개 조회 (인증 불필요) — 프론트 SEO/메타 결합용" })
  @Get("public")
  publicGet() {
    return this.service.get()
  }

  @ApiOperation({ summary: "사이트 공통 정보 조회 (어드민)" })
  @Get()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  get() {
    return this.service.get()
  }

  @ApiOperation({ summary: "사이트 공통 정보 수정 (어드민)" })
  @Put()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  update(@Body() dto: UpdateSiteConfigDto, @AuthUser() user: User) {
    return this.service.update(dto, user)
  }
}
