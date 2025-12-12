import { Injectable } from "@nestjs/common"
import { PaletteWebhookDto } from "./palette-webhook.dto"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import { ReservationService } from "@root/reservation/service/reservation.service"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as dayjs from "dayjs"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    private readonly reservationService: ReservationService,
    private config: ConfigService,
  ) {}

  async handlePaletteUpdate(data: PaletteWebhookDto, authHeader: string) {
    // 1. webhook 인증 검증(옵션)
    const secret = this.config.get<string>("DOCTOR_PALETTE_WEBHOOK_SECRET")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { message: "Unauthorized" }
    }

    const token = authHeader.replace("Bearer ", "").trim()

    if (token !== secret) {
      return { message: "Invalid token" }
    }
    // 2. planId 로 우리 예약 찾기
    const reservation = await this.reservationRepo.findOne({
      where: { palettePlanId: data.id },
    })
    if (!reservation) return { message: "Reservation not found" }

    // 3. DB 업데이트
    // reservation.status = data.status
    // reservation.datetime = data.dateTime
    reservation.datetime = dayjs(data.dateTime).toDate()
    await this.reservationRepo.save(reservation)

    // 4. 메시지 발송 등 처리
    if (data.status === "CONFIRMED") {
      const user = reservation.user // eager 로 이미 로드됨
      console.log("Send message to:", user.phoneNumber)
      // 메시지 발송 서비스 호출
      await this.reservationService.sendPaletteReservationConfirmationMessage(reservation)
    }
  }
}
