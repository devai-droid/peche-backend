import { Body, Controller, Post } from "@nestjs/common"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { DEFAULT_VERIFICATION_CODE_DIGIT, JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { SmsService } from "@root/message/service/sms.service"
import { SmsDtoByAdmin } from "@root/admin/dto/admin-sms.dto"
import { randomXDigit } from "@root/shared/utils"

@Controller("admin/sms")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class AdminSmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post("/verification-test")
  async sendVerificationTestCode(@Body() dto: SmsDtoByAdmin) {
    await this.smsService.sendVerificationCodeSms(dto.phoneNumber, randomXDigit(DEFAULT_VERIFICATION_CODE_DIGIT))
  }
}
