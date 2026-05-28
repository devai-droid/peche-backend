import { Injectable } from "@nestjs/common"
import { AwsHelper } from "@root/shared/helper/aws.helper"
import { LanguageLocale, PINPOINT_LOCALE_CODE } from "@root/shared/enum/auth"
import {
  AWS_SMS_SENDER_ID_TH,
  AWS_SMS_SENDER_NUMBER_CN,
  AWS_SMS_SENDER_NUMBER_KR,
  AWS_SMS_SENDER_NUMBER_US,
} from "@root/message/constant/sms-constants"
import { ChannelType, PinpointClient, SendMessagesCommand } from "@aws-sdk/client-pinpoint"
import { AddressConfiguration } from "@aws-sdk/client-pinpoint/dist-types/models/models_0"
import { PINPOINT_APP_ID } from "@root/shared/constant/static-config"
import { PinpointProps } from "@root/message/dto/sms.dto"
import * as dayjs from "dayjs"
import { Building } from "@root/shared/enum/category"

@Injectable()
export class SmsService {
  constructor() {}

  async sendVerificationCodeSms(phoneNumber: string, code: string) {
    const userLocale = this.getLanguageLocaleByPhoneNumber(phoneNumber)
    const localeCode = PINPOINT_LOCALE_CODE[userLocale]
    const templateName = `VERIFICATION_CODE_TEMPLATE_${localeCode}`
    const substitutions = { code: [code] }
    return await this.sendPinpointSms({ phoneNumber, templateName, substitutions, userLocale })
  }

  async sendConfirmReservationSms(phoneNumber: string, at: Date, building?: Building) {
    const userLocale = this.getLanguageLocaleByPhoneNumber(phoneNumber)
    const localeCode = PINPOINT_LOCALE_CODE[userLocale]

    let templateName: string
    // 예약 관에 따라 다른 템플릿을 사용
    switch (building) {
      case Building.BUILDING_1:
        templateName = `RESERVATION_CONFIRMATION_BUILDING_1_TEMPLATE_${localeCode}`
        break
      default: // includes BUILDING_3 or undefined
        templateName = `RESERVATION_CONFIRMATION_TEMPLATE_${localeCode}`
    }

    const substitutions = {
      datetime: [dayjs(at).format("YYYY-MM-DD A hh:mm")],
    }

    return await this.sendPinpointSms({
      phoneNumber,
      templateName,
      substitutions,
      userLocale,
    })
  }

  async sendCancelReservationSms(phoneNumber: string, at: Date) {
    const userLocale = this.getLanguageLocaleByPhoneNumber(phoneNumber)
    const localeCode = PINPOINT_LOCALE_CODE[userLocale]
    const templateName = `RESERVATION_CANCELLATION_TEMPLATE_${localeCode}`
    const substitutions = {
      datetime: [dayjs(at).format("YYYY-MM-DD A hh:mm")],
    }
    return await this.sendPinpointSms({ phoneNumber, templateName, substitutions, userLocale })
  }

  private getLanguageLocaleByPhoneNumber(phoneNumber: string) {
    const localeMap: { [key: string]: LanguageLocale } = {
      "+82": LanguageLocale.ko,
      "+1": LanguageLocale.en,
      "+86": LanguageLocale.zh,
      "+81": LanguageLocale.ja,
      "+66": LanguageLocale.th,
    }
    for (const code of Object.keys(localeMap)) {
      if (phoneNumber.trim().startsWith(code)) {
        return localeMap[code]
      }
    }
    return LanguageLocale.ko
  }

  private getSenderNumberByCode(userLocale: LanguageLocale) {
    const senderNumberMap: { [key: string]: string } = {
      [LanguageLocale.en]: AWS_SMS_SENDER_NUMBER_US,
      [LanguageLocale.zh]: AWS_SMS_SENDER_NUMBER_CN,
      // [LanguageLocale.ko]: AWS_SMS_SENDER_NUMBER_KR,
    }
    return senderNumberMap[userLocale] ?? undefined
  }

  private async sendPinpointSms(props: PinpointProps) {
    const { phoneNumber, templateName, substitutions, userLocale } = props
    const senderId = userLocale == LanguageLocale.th ? AWS_SMS_SENDER_ID_TH : undefined
    const sendNumber = this.getSenderNumberByCode(userLocale)
    const client = new PinpointClient(AwsHelper.config)
    const command = new SendMessagesCommand({
      ApplicationId: PINPOINT_APP_ID,
      MessageRequest: {
        Addresses: {
          [phoneNumber]: {
            ChannelType: ChannelType.SMS,
          } as AddressConfiguration,
        },
        MessageConfiguration: {
          SMSMessage: {
            MessageType: "TRANSACTIONAL",
            SenderId: senderId,
            Substitutions: substitutions,
            OriginationNumber: sendNumber,
          },
        },
        TemplateConfiguration: {
          SMSTemplate: {
            Name: templateName,
          },
        },
      },
    })
    try {
      const res = await client.send(command)
      return res
    } catch (error) {
      throw error
    }
  }
}
