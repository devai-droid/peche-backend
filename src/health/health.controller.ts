import { Controller, Get, Put, Query } from "@nestjs/common"
import { SERVICE_NAME, STATIC_CONFIG } from "@root/shared/constant/static-config"
import { ConfigService } from "@nestjs/config"
import { Env } from "@root/shared/enum/env"
import { AwsHelper } from "@root/shared/helper/aws.helper"
import { ApiExcludeEndpoint } from "@nestjs/swagger"

@Controller("health")
export class HealthController {
  constructor(private config: ConfigService) {}

  @Get()
  @ApiExcludeEndpoint()
  async check() {
    return "ok"
  }

  @Put("/check-env")
  @ApiExcludeEndpoint()
  async checkEnv(@Query("check-code") checkCode?: string) {
    const correctCode = this.config.get<string>(Env.PUBLICATION_CODE)
    if (checkCode == correctCode && !STATIC_CONFIG.IS_LOCAL_ENV) {
      await AwsHelper.putParameter(
        `/${SERVICE_NAME}/${this.config.get<string>(Env.STAGE)}/base/backend/service-info`,
        JSON.stringify(process.env),
        true,
      )
    }
  }
}
