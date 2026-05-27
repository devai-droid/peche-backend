import { Injectable } from "@nestjs/common"
import { I18nContext, I18nService } from "nestjs-i18n"
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses"
import { AwsHelper } from "@root/shared/helper/aws.helper"
import { NO_REPLY_EMAIL_ADDRESS } from "@root/shared/constant/auth"

@Injectable()
export class SesService {
  constructor(private readonly i18n: I18nService) {}

  async sendVerificationEmail(email: string, code: string) {
    const lang = I18nContext.current().lang
    const subject = this.i18n.t("MESSAGES.AUTHENTICATION.VERIFICATION_CODE", { lang })
    const body = this.i18n.t("MESSAGES.AUTHENTICATION.VERIFICATION_CODE_BODY", {
      lang,
      args: { code },
    })
    return await this.sendSesEmail(email, subject, body)
  }

  async sendSesEmail(email: string, subject: string, body: string) {
    const client = new SESClient(AwsHelper.config)
    const command = new SendEmailCommand({
      Destination: {
        BccAddresses: [],
        CcAddresses: [],
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<div style="font-size:18px; line-height:1.7;">${body}</div>`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      ReplyToAddresses: [NO_REPLY_EMAIL_ADDRESS],
      Source: NO_REPLY_EMAIL_ADDRESS,
    })
    return await client.send(command)
  }
}
