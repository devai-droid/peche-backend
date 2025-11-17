import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { User } from "@root/shared/interface/user"
import { IntegratedCrmCategory } from "@root/smart-doctor/entities/integrated-crm-category.entity"
import {
  CreateIntegratedCrmCategoryDto,
  UpdateIntegratedCrmCategoryDto,
} from "@root/smart-doctor/dto/integrated-crm-category.dto"
import { CrmCategoryService } from "@root/smart-doctor/service/crm-category.service"
import { Building } from "@root/shared/enum/category"

@Injectable()
export class IntegratedCrmCategoryService {
  constructor(
    @InjectRepository(IntegratedCrmCategory) private readonly repository: Repository<IntegratedCrmCategory>,
    @Inject(forwardRef(() => CrmCategoryService)) private readonly crmCategoryService: CrmCategoryService,
  ) {}

  async create(dto: CreateIntegratedCrmCategoryDto) {
    const building1CrmCategory = await this.crmCategoryService.findOne(dto.building1CrmCategoryCode)
    const building2CrmCategory = await this.crmCategoryService.findOne(dto.building2CrmCategoryCode)
    const building3CrmCategory = await this.crmCategoryService.findOne(dto.building3CrmCategoryCode)

    // 우선순위 유효성 검사 및 자동 계산
    const { firstPriorityBuilding, secondPriorityBuilding } = this.validateAndCalculatePriorities(
      dto.firstPriorityBuilding,
      dto.secondPriorityBuilding,
    )

    return await this.repository.save(
      Object.assign(dto, {
        building1CrmCategory,
        building2CrmCategory,
        building3CrmCategory,
        firstPriorityBuilding,
        secondPriorityBuilding,
      }),
    )
  }

  async bulkCreate(dtos: CreateIntegratedCrmCategoryDto[]) {
    return Promise.all(dtos.map(async (dto) => await this.create(dto)))
  }

  async findMany() {
    return this.repository.find({ order: { order: "ASC" } })
  }

  async findOne(id: string) {
    return this.repository.findOneByOrFail({ id: id })
  }

  async findOneByNameOrNull(name: string) {
    const entityName = "integrated_crm_category"
    const queryBuilder = this.repository.createQueryBuilder(entityName)
    queryBuilder.andWhere(`REPLACE(name, ' ', '') LIKE '${name.replaceAll(" ", "")}'`)
    return queryBuilder.getOne()
  }

  async update(id: string, dto: UpdateIntegratedCrmCategoryDto, updatedBy?: User) {
    const integratedCrmCategory = await this.findOne(id)
    const building1CrmCategory = dto.building1CrmCategoryCode
      ? await this.crmCategoryService.findOne(dto.building1CrmCategoryCode)
      : undefined
    const building2CrmCategory = dto.building2CrmCategoryCode
      ? await this.crmCategoryService.findOne(dto.building2CrmCategoryCode)
      : undefined
    const building3CrmCategory = dto.building3CrmCategoryCode
      ? await this.crmCategoryService.findOne(dto.building3CrmCategoryCode)
      : undefined

    // 우선순위 유효성 검사 및 자동 계산
    const { firstPriorityBuilding, secondPriorityBuilding } = this.validateAndCalculatePriorities(
      dto.firstPriorityBuilding || integratedCrmCategory.firstPriorityBuilding,
      dto.secondPriorityBuilding || integratedCrmCategory.secondPriorityBuilding,
    )

    return await this.repository.save(
      Object.assign(integratedCrmCategory, dto, {
        ...(building1CrmCategory && { building1CrmCategory }),
        ...(building2CrmCategory && { building2CrmCategory }),
        ...(building3CrmCategory && { building3CrmCategory }),
        firstPriorityBuilding,
        secondPriorityBuilding,
        updatedBy: updatedBy?.id,
      }),
    )
  }

  async bulkUpdate(dtos: UpdateIntegratedCrmCategoryDto[], user: User) {
    return await Promise.all(dtos.map(async (dto) => (dto.id ? await this.update(dto.id, dto, user) : null)))
  }

  async remove(id: string) {
    const integratedCrmCategory = await this.findOne(id)
    return await this.repository.remove(integratedCrmCategory)
  }

  async getCrmCodesByBuilding(building: Building) {
    const integratedCrmCategories = await this.findMany()
    const crmCodes = integratedCrmCategories
      .map((integratedCrmCategory) => {
        if (building === Building.BUILDING_1) {
          return integratedCrmCategory.building1CrmCategory?.code
        } else if (building === Building.BUILDING_2) {
          return integratedCrmCategory.building2CrmCategory?.code
        } else if (building === Building.BUILDING_3) {
          return integratedCrmCategory.building3CrmCategory?.code
        }
        return null
      })
      .filter((it) => !!it)
    return crmCodes && crmCodes.length > 0 ? crmCodes : []
  }

  /**
   * 우선순위의 유효성을 검사하고, 필요한 경우 자동으로 계산합니다.
   * - 1순위와 2순위가 같을 수 없습니다.
   * - 1순위나 2순위가 설정되지 않은 경우 자동으로 계산합니다.
   * - 3순위는 자동으로 계산됩니다 (별도 저장하지 않음).
   */
  private validateAndCalculatePriorities(firstPriority?: Building, secondPriority?: Building) {
    // 1순위가 지정되지 않은 경우 기본값 BUILDING_1로 설정
    if (!firstPriority) {
      firstPriority = Building.BUILDING_1
    }

    // 2순위가 지정되지 않았거나 1순위와 같은 경우
    if (!secondPriority || secondPriority === firstPriority) {
      // 1순위가 BUILDING_1인 경우 BUILDING_2를 2순위로 설정, 아니면 BUILDING_1을 2순위로 설정
      secondPriority = firstPriority === Building.BUILDING_1 ? Building.BUILDING_2 : Building.BUILDING_1
    }

    return { firstPriorityBuilding: firstPriority, secondPriorityBuilding: secondPriority }
  }
}
