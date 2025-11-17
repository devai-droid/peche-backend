import { Inject, Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { ReservationService } from "@root/reservation/service/reservation.service"
import { ConfigService } from "@nestjs/config"
import { Env } from "@root/shared/enum/env"

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name)
  private readonly STAGE: string

  constructor(
    @Inject(ReservationService)
    private readonly reservationService: ReservationService,
    private config: ConfigService,
  ) {
    this.STAGE = this.config.get<string>(Env.STAGE)
  }

  // At 09:00 every day
  @Cron("0 0 9 * * *", {
    name: "send-reservation-remind-notification",
    timeZone: "Asia/Seoul",
  })
  async handleReservationRemindNotification() {
    // check if scheduler is enabled
    if (this.STAGE == "dev") {
      this.logger.log("send-reservation-remind-notification job cron started")
      await this.reservationService.sendReservationTheDayMessage()
      await this.reservationService.sendReservationDayBeforeMessage()
      this.logger.log("send-reservation-remind-notification job cron finished")
    }
  }
}
