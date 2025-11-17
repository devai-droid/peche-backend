import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import { ReservationEvent } from "@root/reservation/entities/reservation-event.entity"
import { ReservationProduct } from "@root/reservation/entities/reservation-product.entity"
import { ReservationSlot } from "@root/reservation/entities/reservation-slot.entity"
import { CloseDay } from "@root/reservation/entities/close-day.entity"
import { SpecificDateSlot } from "@root/reservation/entities/specific-date-slot.entity"
import { ProductModule } from "@root/product/product.module"
import { EventModule } from "@root/event/event.module"
import { ReservationService } from "@root/reservation/service/reservation.service"
import { ReservationEventService } from "@root/reservation/service/reservation-event.service"
import { ReservationProductService } from "@root/reservation/service/reservation-product.service"
import { ReservationSlotService } from "@root/reservation/service/reservation-slot.service"
import { CloseDayService } from "@root/reservation/service/close-day.service"
import { SmartDoctorModule } from "@root/smart-doctor/smart-doctor.module"
import { SpecificDate } from "@root/reservation/entities/specific-date.entity"
import { SpecificDateService } from "@root/reservation/service/specific-date.service"
import { SpecificDateSlotService } from "@root/reservation/service/specific-date-slot.service"
import { CloseDayController } from "@root/reservation/controller/close-day.controller"
import { ReservationController } from "@root/reservation/controller/reservation.controller"
import { ReservationSlotController } from "@root/reservation/controller/reservation-slot.controller"
import { SpecificDateController } from "@root/reservation/controller/specific-date.controller"
import { UsersModule } from "@root/users/users.module"
import { SystemModule } from "@root/system/system.module"
import { MessageModule } from "@root/message/message.module"
import { NotificationScheduler } from "@root/reservation/scheduler/notification-scheduler"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationEvent,
      ReservationProduct,
      ReservationSlot,
      CloseDay,
      SpecificDate,
      SpecificDateSlot,
    ]),
    forwardRef(() => ProductModule),
    forwardRef(() => EventModule),
    forwardRef(() => SmartDoctorModule),
    forwardRef(() => UsersModule),
    forwardRef(() => SystemModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [CloseDayController, ReservationController, ReservationSlotController, SpecificDateController],
  providers: [
    ReservationService,
    ReservationEventService,
    ReservationProductService,
    ReservationSlotService,
    CloseDayService,
    SpecificDateService,
    SpecificDateSlotService,
    NotificationScheduler,
  ],
  exports: [
    ReservationService,
    ReservationEventService,
    ReservationProductService,
    ReservationSlotService,
    CloseDayService,
    SpecificDateService,
    SpecificDateSlotService,
  ],
})
export class ReservationModule {}
