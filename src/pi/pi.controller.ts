import { Controller, Get, Post } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { PiSyncService } from "./pi-sync.service"

@Controller("pi")
@ApiTags("pi")
export class PiController {
  constructor(private readonly sync: PiSyncService) {}

  @ApiOperation({ summary: "PI(챗봇) 동기화 미리보기 — 실행 없이 계획만" })
  @Get("preview")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  preview() {
    return this.sync.preview()
  }

  @ApiOperation({ summary: "PI(챗봇) 수동 동기화 실행" })
  @Post("sync")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  run() {
    return this.sync.syncNow()
  }
}
