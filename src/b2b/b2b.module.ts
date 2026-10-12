import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { B2bCompany } from "@root/b2b/entities/b2b-company.entity"
import { B2bVerification } from "@root/b2b/entities/b2b-verification.entity"
import { B2bReservation } from "@root/b2b/entities/b2b-reservation.entity"
import { B2bSetting } from "@root/b2b/entities/b2b-setting.entity"
import { B2bService } from "@root/b2b/service/b2b.service"
import { B2bAdminController, B2bController } from "@root/b2b/controller/b2b.controller"
import { AuthModule } from "@root/auth/auth.module"
import { ReservationModule } from "@root/reservation/reservation.module"

/** 협약 기업 직원 전용 예약(B2B 사이트). 테이블은 모두 b2b schema(운영 public.* 무손). */
@Module({
  imports: [
    TypeOrmModule.forFeature([B2bCompany, B2bVerification, B2bReservation, B2bSetting]),
    forwardRef(() => AuthModule),
    forwardRef(() => ReservationModule),
  ],
  controllers: [B2bController, B2bAdminController],
  providers: [B2bService],
})
export class B2bModule {}
