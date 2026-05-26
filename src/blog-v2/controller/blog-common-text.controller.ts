import { Body, Controller, Get, Param, Put } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { BlogCommonTextService } from "@root/blog-v2/services/blog-common-text.service"
import { BlogCommonTextType } from "@root/blog-v2/entities/common-text.entity"
import { UpdateCommonTextDto } from "@root/blog-v2/dto/common-text.dto"

@Controller("blog-v2/common-texts")
@ApiTags("blog-v2/common-texts")
export class BlogCommonTextController {
  constructor(private readonly service: BlogCommonTextService) {}

  @ApiOperation({ summary: "공통 고지문구 공개 조회 (활성만, 인증 불필요) — 프론트 글 하단 결합용" })
  @Get("public")
  publicActive() {
    return this.service.findActive()
  }

  @ApiOperation({ summary: "공통 고지문구 전체 (어드민 편집용 — 4종)" })
  @Get()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  findAll() {
    return this.service.findAllForAdmin()
  }

  @ApiOperation({ summary: "공통 고지문구 수정 (type별 upsert)" })
  @Put(":type")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  upsert(
    @Param("type") type: BlogCommonTextType,
    @Body() dto: UpdateCommonTextDto,
    @AuthUser() user: User,
  ) {
    return this.service.upsert(type, dto, user)
  }
}
