import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { PaletteWebhookDto } from "./palette-webhook.dto"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import { ReservationService } from "@root/reservation/service/reservation.service"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as dayjs from "dayjs"
import { ConfigService } from "@nestjs/config"
import { ReservationStatus } from "@root/shared/enum/reservation"

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepo: Repository<Reservation>,
    @Inject(forwardRef(() => ReservationService))
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
      relations: ["user"],
      where: { palettePlanId: data.id },
    })
    if (!reservation) {
      return { message: "Reservation not found" }
    }

    // 예약 확정 케이스. 메시지 발송 등 처리
    if (data.status === "CONFIRMED" && reservation.status === ReservationStatus.WAITING) {
      // 예약 시간, 예약 status DB 업데이트
      reservation.datetime = dayjs(data.dateTime).toDate()
      reservation.status = ReservationStatus.DONE
      await this.reservationRepo.save(reservation)
      // 메시지 발송 서비스 호출
      await this.reservationService.sendPaletteReservationConfirmationMessage(reservation)
    }

    // 예약 취소/거절 케이스
    if (data.status === "CANCELED" && reservation.status !== ReservationStatus.CANCELED) {
      reservation.status = ReservationStatus.CANCELED
      await this.reservationRepo.save(reservation)
      await this.reservationService.sendCancelReservationMessage(reservation)
    }
  }
}
