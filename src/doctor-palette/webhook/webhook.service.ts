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
    // 닥팔이 같은 확정 웹훅을 거의 동시에 두 번 보내면, 두 요청이 모두 WAITING을 읽고
    // 둘 다 알림톡을 보내는 경쟁 조건이 생긴다. 상태 전환을 '조건부 단일 UPDATE'로 처리해
    // 실제로 WAITING -> DONE 으로 바꾼 요청 하나만 알림톡을 발송하도록 막는다.
    if (data.status === "CONFIRMED" && reservation.status === ReservationStatus.WAITING) {
      const confirmedDatetime = dayjs(data.dateTime).toDate()
      const result = await this.reservationRepo.update(
        { id: reservation.id, status: ReservationStatus.WAITING },
        { datetime: confirmedDatetime, status: ReservationStatus.DONE },
      )
      // 실제로 상태를 바꾼(= 경쟁에서 이긴) 요청만 메시지 발송
      if (result.affected === 1) {
        reservation.datetime = confirmedDatetime
        reservation.status = ReservationStatus.DONE
        await this.reservationService.sendPaletteReservationConfirmationMessage(reservation)
      }
    }

    // 예약 취소 (확정 후 취소)
    if (data.status === "CANCELED" && reservation.status === ReservationStatus.DONE) {
      const result = await this.reservationRepo.update(
        { id: reservation.id, status: ReservationStatus.DONE },
        { status: ReservationStatus.CANCELED },
      )
      if (result.affected === 1) {
        reservation.status = ReservationStatus.CANCELED
        await this.reservationService.sendCancelReservationMessage(reservation)
      }
    }

    // 예약 거부 (확정 전 거부)
    if (data.status === "CANCELED" && reservation.status === ReservationStatus.WAITING) {
      const result = await this.reservationRepo.update(
        { id: reservation.id, status: ReservationStatus.WAITING },
        { status: ReservationStatus.CANCELED },
      )
      if (result.affected === 1) {
        reservation.status = ReservationStatus.CANCELED
        await this.reservationService.sendRejectReservationMessage(reservation)
      }
    }
  }
}
