import { CrmCategory } from "@root/smart-doctor/entities/crm-category.entity"
import { Building } from "@root/shared/enum/category"

export interface CategoryGroup {
  id: string
  building1CrmCategory?: CrmCategory
  building2CrmCategory?: CrmCategory
  building3CrmCategory?: CrmCategory

  getPriorities(): Building[] | null

  getPriorityCrmCategories(): CrmCategoryWithBuilding[]

  isActivated(): boolean

  isLangCategories(): boolean
}

export interface CrmCategoryWithBuilding {
  crmCategory: CrmCategory
  building: Building
}
