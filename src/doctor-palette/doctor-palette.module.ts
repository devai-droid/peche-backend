import { Module } from "@nestjs/common"
import { DoctorPaletteRepository } from "./repository/doctor-palette.repository"
import { WebhookController } from "./webhook/webhook.controller"
import { WebhookService } from "./webhook/webhook.service"

@Module({
  controllers: [WebhookController],
  providers: [DoctorPaletteRepository, WebhookService],
  exports: [DoctorPaletteRepository],
})
export class DoctorPaletteModule {}
