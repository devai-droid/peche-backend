import { Module } from "@nestjs/common"
import { DoctorPaletteRepository } from "./repository/doctor-palette.repository"

@Module({
  providers: [DoctorPaletteRepository],
  exports: [DoctorPaletteRepository],
})
export class DoctorPaletteModule {}
