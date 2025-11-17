import { Injectable } from "@nestjs/common"
import { SmartDoctorRepository } from "@root/smart-doctor/repository/smart-doctor.repository"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CrmCategory } from "@root/smart-doctor/entities/crm-category.entity"
import { User } from "@root/shared/interface/user"
import { UpdateCrmCategoryDto } from "@root/smart-doctor/dto/crm-category.dto"
import { SUBJECT_CODE } from "@root/shared/constant/smart-doctor"

@Injectable()
export class CrmCategoryService {
  constructor(
    @InjectRepository(CrmCategory) private readonly repository: Repository<CrmCategory>,
    private readonly smartDoctorRepository: SmartDoctorRepository,
  ) {}

  async refreshCrmCategories() {
    const crmCategoriesFromApi = (await this.smartDoctorRepository.getCrmCategories()).filter(
      (crmCategory) => crmCategory.subjectCode == SUBJECT_CODE,
    )
    const crmCategoriesFromDb = await this.repository.find()
    const newCrmCategories = crmCategoriesFromApi.filter(
      (apiCategory) => !crmCategoriesFromDb.find((dbCategory) => dbCategory.code === apiCategory.code),
    )
    const updatedCrmCategories = crmCategoriesFromDb.filter((dbCategory) =>
      crmCategoriesFromApi.find((apiCategory) => apiCategory.code === dbCategory.code),
    )
    for (const crmCategory of updatedCrmCategories) {
      const apiCategory = crmCategoriesFromApi.find((apiCategory) => apiCategory.code === crmCategory.code)
      if (apiCategory) {
        crmCategory.name = apiCategory.name
        crmCategory.subjectCode = apiCategory.subjectCode
        crmCategory.subjectName = apiCategory.subjectName
      }
    }
    await this.repository.save(newCrmCategories)
    await this.repository.save(updatedCrmCategories)
    return this.repository.find()
  }

  async findMany() {
    return this.repository.find({ order: { code: "ASC" } })
  }

  async findOne(code: string) {
    return this.repository.findOneByOrFail({ code: code })
  }

  async update(code: string, dto: UpdateCrmCategoryDto, updatedBy?: User) {
    const crmCategory = await this.findOne(code)
    return await this.repository.save(Object.assign(crmCategory, dto, { updatedBy: updatedBy?.id }))
  }

  async remove(code: string) {
    const crmCategory = await this.findOne(code)
    return await this.repository.remove(crmCategory)
  }
}
