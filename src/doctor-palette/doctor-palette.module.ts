import { Module, forwardRef } from "@nestjs/common"
import { DoctorPaletteRepository } from "./repository/doctor-palette.repository"
import { WebhookController } from "./webhook/webhook.controller"
import { WebhookService } from "./webhook/webhook.service"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ReservationModule } from "@root/reservation/reservation.module"

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), forwardRef(() => ReservationModule)],
  controllers: [WebhookController],
  providers: [DoctorPaletteRepository, WebhookService],
  exports: [DoctorPaletteRepository],
})
export class DoctorPaletteModule {}
