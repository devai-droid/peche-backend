import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Event } from "@root/event/entities/event.entity"
import { SmartDoctorModule } from "@root/smart-doctor/smart-doctor.module"
import { EventCategory } from "@root/event/entities/event-category.entity"
import { ProductModule } from "@root/product/product.module"
import { EventController } from "@root/event/controller/event.controller"
import { EventCategoryController } from "@root/event/controller/event-category.controller"
import { EventService } from "@root/event/service/event.service"
import { EventCategoryService } from "@root/event/service/event-category.service"
import { EventBundle } from "@root/event/entities/event-bundle.entity"
import { EventBackup } from "@root/event/entities/event-backup.entity"
import { EventBackupBundle } from "@root/event/entities/event-backup-bundle.entity"
import { EventBackupService } from "@root/event/service/event-backup.service"
import { EventBundleController } from "@root/event/controller/event-bundle.controller"
import { EventBackupBundleController } from "@root/event/controller/event-backup-bundle.controller"
import { EventBundleService } from "@root/event/service/event-bundle.service"
import { EventBackupBundleService } from "@root/event/service/event-backup-bundle.service"
import { EventBackupController } from "@root/event/controller/event-backup.controller"

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventCategory, EventBundle, EventBackupBundle, EventBackup]),
    forwardRef(() => ProductModule),
    forwardRef(() => SmartDoctorModule),
  ],
  controllers: [
    EventController,
    EventCategoryController,
    EventBundleController,
    EventBackupBundleController,
    EventBackupController,
  ],
  providers: [EventService, EventCategoryService, EventBundleService, EventBackupBundleService, EventBackupService],
  exports: [EventService, EventCategoryService, EventBundleService, EventBackupBundleService, EventBackupService],
})
export class EventModule {}
