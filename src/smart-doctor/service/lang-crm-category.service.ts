import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { User } from "@root/shared/interface/user"
import { LangCrmCategory } from "@root/smart-doctor/entities/lang-crm-category.entity"
import { CreateLangCrmCategoryDto, UpdateLangCrmCategoryDto } from "@root/smart-doctor/dto/lang-crm-category.dto"
import { CrmCategoryService } from "@root/smart-doctor/service/crm-category.service"
import { Building, LangCategoryStatus } from "@root/shared/enum/category"
import { LanguageLocale } from "@root/shared/enum/auth"

@Injectable()
export class LangCrmCategoryService {
  constructor(
    @InjectRepository(LangCrmCategory) private readonly repository: Repository<LangCrmCategory>,
    @Inject(forwardRef(() => CrmCategoryService)) private readonly crmCategoryService: CrmCategoryService,
  ) {}

  async create(dto: CreateLangCrmCategoryDto) {
    const building1CrmCategory = dto.building1CrmCategoryId
      ? await this.crmCategoryService.findOne(dto.building1CrmCategoryId)
      : undefined
    const building2CrmCategory = dto.building2CrmCategoryId
      ? await this.crmCategoryService.findOne(dto.building2CrmCategoryId)
      : undefined
    const building3CrmCategory = dto.building3CrmCategoryId
      ? await this.crmCategoryService.findOne(dto.building3CrmCategoryId)
      : undefined

    // 우선순위 건물 유효성 검사
    const buildingPriorities = this.validateBuildingPriorities(dto.buildingPriorities)

    return await this.repository.save(
      Object.assign(dto, {
        building1CrmCategory,
        building2CrmCategory,
        building3CrmCategory,
        buildingPriorities,
        status: dto.status || LangCategoryStatus.ACTIVE,
      }),
    )
  }

  async bulkCreate(dtos: CreateLangCrmCategoryDto[]) {
    return Promise.all(dtos.map(async (dto) => await this.create(dto)))
  }

  async findMany() {
    return this.repository.find({ order: { order: "ASC" } })
  }

  async findByLang(lang: LanguageLocale) {
    return this.repository.find({ where: { lang }, order: { order: "ASC" } })
  }

  async findByStatus(status: LangCategoryStatus) {
    return this.repository.find({ where: { status }, order: { order: "ASC" } })
  }

  async findOne(id: string) {
    return this.repository.findOneByOrFail({ id: id })
  }

  async findOneByNameOrNull(name: string, lang: LanguageLocale) {
    const entityName = "lang_crm_category"
    const queryBuilder = this.repository.createQueryBuilder(entityName)
    queryBuilder.andWhere(`REPLACE(name, ' ', '') LIKE '${name.replaceAll(" ", "")}'`)
    queryBuilder.andWhere(`lang = :lang`, { lang })
    return queryBuilder.getOne()
  }

  async update(id: string, dto: UpdateLangCrmCategoryDto, updatedBy?: User) {
    const langCrmCategory = await this.findOne(id)
    const building1CrmCategory = dto.building1CrmCategoryId
      ? await this.crmCategoryService.findOne(dto.building1CrmCategoryId)
      : undefined
    const building2CrmCategory = dto.building2CrmCategoryId
      ? await this.crmCategoryService.findOne(dto.building2CrmCategoryId)
      : undefined
    const building3CrmCategory = dto.building3CrmCategoryId
      ? await this.crmCategoryService.findOne(dto.building3CrmCategoryId)
      : undefined

    // 우선순위 건물 유효성 검사
    const buildingPriorities = this.validateBuildingPriorities(
      dto.buildingPriorities || langCrmCategory.buildingPriorities,
    )

    return await this.repository.save(
      Object.assign(langCrmCategory, dto, {
        ...(building1CrmCategory && { building1CrmCategory }),
        ...(building2CrmCategory && { building2CrmCategory }),
        ...(building3CrmCategory && { building3CrmCategory }),
        buildingPriorities,
        updatedBy: updatedBy?.id,
      }),
    )
  }

  async bulkUpdate(dtos: UpdateLangCrmCategoryDto[], user: User) {
    return await Promise.all(dtos.map(async (dto) => (dto.id ? await this.update(dto.id, dto, user) : null)))
  }

  async remove(id: string) {
    const langCrmCategory = await this.findOne(id)
    return await this.repository.remove(langCrmCategory)
  }

  async toggleStatus(id: string, user: User) {
    const langCrmCategory = await this.findOne(id)
    const newStatus =
      langCrmCategory.status === LangCategoryStatus.ACTIVE ? LangCategoryStatus.INACTIVE : LangCategoryStatus.ACTIVE

    return await this.repository.save(
      Object.assign(langCrmCategory, {
        status: newStatus,
        updatedBy: user?.id,
      }),
    )
  }

  /**
   * 우선순위 건물들의 유효성을 검사하고, 필요한 경우 자동으로 보정합니다.
   * - 중복된 건물이 포함되어 있으면 제거합니다.
   * - 비어있거나 유효하지 않은 경우 기본값으로 설정합니다.
   */
  private validateBuildingPriorities(buildingPriorities?: Building[]): Building[] {
    if (!buildingPriorities || buildingPriorities.length === 0) {
      // 기본 우선순위: BUILDING_1, BUILDING_2, BUILDING_3
      return [Building.BUILDING_1, Building.BUILDING_2, Building.BUILDING_3]
    }

    // 중복 제거하고 유효한 값만 필터링
    const validBuildings = [...new Set(buildingPriorities)].filter((building) =>
      Object.values(Building).includes(building),
    )

    // 모든 건물이 포함되지 않은 경우, 나머지 건물 추가
    const allBuildings = [Building.BUILDING_1, Building.BUILDING_2, Building.BUILDING_3]
    const missingBuildings = allBuildings.filter((building) => !validBuildings.includes(building))

    return [...validBuildings, ...missingBuildings]
  }
}
