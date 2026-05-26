import { Body, Controller, Get, Put, Query } from "@nestjs/common"
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

  @ApiOperation({ summary: "사이트 공통 정보 공개 조회(언어 병합, 인증 불필요) — 프론트 SEO/메타 결합용" })
  @Get("public")
  publicGet(@Query("lang") lang?: string) {
    return this.service.getMerged(lang)
  }

  @ApiOperation({ summary: "사이트 공통 정보(기본/공통값+ko) 조회 (어드민)" })
  @Get()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  get() {
    return this.service.getBase()
  }

  @ApiOperation({ summary: "언어별 표시값 오버라이드 조회 (어드민)" })
  @Get("i18n")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  getI18n(@Query("lang") lang: string) {
    return this.service.getI18n(lang || "ko")
  }

  @ApiOperation({ summary: "사이트 공통 정보(기본/공통값) 수정 (어드민)" })
  @Put()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  update(@Body() dto: UpdateSiteConfigDto, @AuthUser() user: User) {
    return this.service.updateBase(dto, user)
  }

  @ApiOperation({ summary: "언어별 표시값 오버라이드 수정 (어드민)" })
  @Put("i18n")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  updateI18n(@Query("lang") lang: string, @Body() dto: UpdateSiteConfigDto, @AuthUser() user: User) {
    return this.service.updateI18n(lang || "ko", dto, user)
  }
}
