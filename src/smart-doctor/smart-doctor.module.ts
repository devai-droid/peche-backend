import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CrmCategoryService } from "@root/smart-doctor/service/crm-category.service"
import { SmartDoctorRepository } from "@root/smart-doctor/repository/smart-doctor.repository"
import { CrmCategoryController } from "@root/smart-doctor/controller/crm-category.controller"
import { CrmCategory } from "@root/smart-doctor/entities/crm-category.entity"
import { IntegratedCrmCategory } from "./entities/integrated-crm-category.entity"
import { IntegratedCrmCategoryService } from "@root/smart-doctor/service/integrated-crm-category.service"
import { IntegratedCrmCategoryController } from "@root/smart-doctor/controller/integrated-crm-category.controller"
import { SmartDoctorController } from "@root/smart-doctor/controller/smart-doctor.controller"
import { LangCrmCategory } from "./entities/lang-crm-category.entity"
import { LangCrmCategoryService } from "./service/lang-crm-category.service"
import { LangCrmCategoryController } from "./controller/lang-crm-category.controller"

@Module({
  imports: [TypeOrmModule.forFeature([CrmCategory, IntegratedCrmCategory, LangCrmCategory])],
  controllers: [
    CrmCategoryController,
    IntegratedCrmCategoryController,
    SmartDoctorController,
    LangCrmCategoryController
  ],
  providers: [
    CrmCategoryService,
    SmartDoctorRepository,
    IntegratedCrmCategoryService,
    LangCrmCategoryService
  ],
  exports: [
    CrmCategoryService,
    SmartDoctorRepository,
    IntegratedCrmCategoryService,
    LangCrmCategoryService
  ],
})
export class SmartDoctorModule {}
