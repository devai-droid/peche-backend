import * as uuid from "uuid"
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Env } from "@root/shared/enum/env"
import axios, { AxiosInstance } from "axios"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { KAKAO_CONSTS, KAKAO_TEMPLATE } from "../constant/kakao-notification.constant"
import { BizMsgMessage, BizMsgRecipient, BizMsgResponse } from "@root/message/dto/kakao-notification.model"
import { KakaoNotification } from "@root/message/entities/kakao-notification.entity"
import { Building } from "@root/shared/enum/category"

@Injectable()
export class KakaoNotificationService {
  private axiosClient: AxiosInstance
  private readonly appKey: string
  private readonly baseURL: string
  private readonly senderKey: string

  constructor(
    @InjectRepository(KakaoNotification) private kakaoNotificationRepository: Repository<KakaoNotification>,
    private config: ConfigService,
  ) {
    this.axiosClient = axios.create({
      baseURL: KAKAO_CONSTS.API_HOST,
      headers: {
        "Content-type": KAKAO_CONSTS.CONTENT_TYPE,
        [KAKAO_CONSTS.SECRET_HEADER_NAME]: config.get<string>(Env.KAKAO_BIZ_MSG_APP_SECRET),
      },
    })
    this.appKey = config.get<string>(Env.KAKAO_BIZ_MSG_APP_KEY)
    this.senderKey = config.get<string>(Env.KAKAO_BIZ_MSG_SENDER_KEY)
    this.baseURL = KAKAO_CONSTS.API_HOST
  }

  async sendDirectionMessage(phoneNumbers: string[], params?: { [key: string]: string }) {
    return await this.sendNotification(KAKAO_TEMPLATE.DIRECTIONS_PARKING, phoneNumbers, params)
  }

  async sendFeedbackAfterwardsMessage(phoneNumbers: string[], params?: { [key: string]: string }) {
    return await this.sendNotification(KAKAO_TEMPLATE.FEEDBACK_AFTERWARDS, phoneNumbers, params)
  }

  async sendOperatingHoursMessage(phoneNumbers: string[], params?: { [key: string]: string }) {
    return await this.sendNotification(KAKAO_TEMPLATE.OPERATING_HOURS, phoneNumbers, params)
  }

  async sendReservationDayBeforeMessage(
    phoneNumbers: string[],
    params?: { [key: string]: string },
    building?: Building,
  ) {
    let template
    // 예약 관에 따라 다른 템플릿을 사용
    switch (building) {
      case Building.BUILDING_1:
        template = KAKAO_TEMPLATE.RESERVATION_DAY_BEFO_BUILDING_1
        break
      default: // BUILDING_3 or undefined
        template = KAKAO_TEMPLATE.RESERVATION_DAY_BEFO
    }

    return await this.sendNotification(template, phoneNumbers, params)
  }

  async sendReservationInstantMessage(phoneNumbers: string[], params?: { [key: string]: string }, building?: Building) {
    let template
    // 예약 관에 따라 다른 템플릿을 사용
    switch (building) {
      case Building.BUILDING_1:
        template = KAKAO_TEMPLATE.RESERVATION_INSTANT_BUILDING_1
        break
      default: // includes BUILDING_3 or undefined
        template = KAKAO_TEMPLATE.RESERVATION_INSTANT
    }

    return await this.sendNotification(template, phoneNumbers, params)
  }

  async sendReservationConfirmationMessage(
    phoneNumbers: string[],
    params?: { [key: string]: string },
    building?: Building,
  ) {
    let template
    // 예약 관에 따라 다른 템플릿을 사용
    switch (building) {
      case Building.BUILDING_1:
        template = KAKAO_TEMPLATE.RESERVATION_CONFIRMATION
        break
      default: // includes BUILDING_3 or undefined
        template = KAKAO_TEMPLATE.RESERVATION_CONFIRMATION
    }

    return await this.sendNotification(template, phoneNumbers, params)
  }

  async sendReservationTheDayMessage(phoneNumbers: string[], params?: { [key: string]: string }, building?: Building) {
    let template
    // 예약 관에 따라 다른 템플릿을 사용
    switch (building) {
      case Building.BUILDING_1:
        template = KAKAO_TEMPLATE.RESERVATION_THE_DAY_BUILDING_1
        break
      default: // includes BUILDING_3 or undefined
        template = KAKAO_TEMPLATE.RESERVATION_THE_DAY
    }

    return await this.sendNotification(template, phoneNumbers, params)
  }

  async sendReservationCancelMessage(phoneNumbers: string[], params?: { [key: string]: string }) {
    return await this.sendNotification(KAKAO_TEMPLATE.RESERVATION_CANCEL, phoneNumbers, params)
  }

  async sendReservationRejectMessage(phoneNumbers: string[], params?: { [key: string]: string }) {
    return await this.sendNotification(KAKAO_TEMPLATE.RESERVATION_REJECT, phoneNumbers, params)
  }

  async sendNotification(templateCode: string, phoneNumbers: string[], params?: { [key: string]: string }) {
    const [id, message] = this.createMessage(templateCode, phoneNumbers, params)
    const savedMessage = await this.saveMessage(id, message)
    return await this.postMessage(savedMessage.message)
  }

  private createMessage(
    templateCode: string,
    phoneNumbers: string[],
    params?: {
      [key: string]: string
    },
  ): [string, BizMsgMessage] {
    const id = uuid.v4()
    return [
      id,
      <BizMsgMessage>{
        templateCode,
        senderKey: this.senderKey,
        recipientList: phoneNumbers.map(
          (phoneNumber) =>
            <BizMsgRecipient>{
              recipientNo: phoneNumber,
              templateParameter: params,
            },
        ),
      },
    ]
  }

  private async saveMessage(id: string, message: BizMsgMessage) {
    return await this.kakaoNotificationRepository.save({ id, message })
  }

  private async postMessage(message: BizMsgMessage) {
    const url = `${KAKAO_CONSTS.API_PREFIX}${this.appKey}${KAKAO_CONSTS.API_SUFFIX}`
    return await this.axiosClient.post<BizMsgResponse>(url, message)
  }
}
