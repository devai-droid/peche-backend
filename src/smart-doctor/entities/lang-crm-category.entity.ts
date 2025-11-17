import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { CrmCategory } from "@root/smart-doctor/entities/crm-category.entity"
import { Building, LangCategoryStatus } from "@root/shared/enum/category"
import { LanguageLocale } from "@root/shared/enum/auth"
import { CategoryGroup, CrmCategoryWithBuilding } from "@root/smart-doctor/entities/category-group"

@Entity()
export class LangCrmCategory extends TimeStampEntity implements CategoryGroup {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ enum: LanguageLocale })
  @Column({ type: "enum", enum: LanguageLocale, nullable: false, unique: true })
  lang: LanguageLocale

  @ApiProperty({ enum: LangCategoryStatus, default: LangCategoryStatus.ACTIVE })
  @Column({
    type: "enum",
    enum: LangCategoryStatus,
    nullable: false,
    default: LangCategoryStatus.ACTIVE,
  })
  status: LangCategoryStatus

  @ApiProperty()
  @Column({ nullable: true })
  name: string

  @ApiProperty()
  @ManyToOne(() => CrmCategory, { nullable: true, eager: true })
  @JoinColumn()
  building1CrmCategory?: CrmCategory

  @ApiProperty()
  @ManyToOne(() => CrmCategory, { nullable: true, eager: true })
  @JoinColumn()
  building2CrmCategory?: CrmCategory

  @ApiProperty()
  @ManyToOne(() => CrmCategory, { nullable: true, eager: true })
  @JoinColumn()
  building3CrmCategory?: CrmCategory

  @ApiProperty({ enum: Building, isArray: true })
  @Column({ type: "enum", array: true, enum: Building, nullable: true })
  buildingPriorities?: Building[]

  @ApiProperty()
  @Column({ nullable: true })
  order?: number

  getPriorities(): Building[] {
    return this.buildingPriorities
  }

  isActivated(): boolean {
    return this.status == LangCategoryStatus.ACTIVE
  }

  isLangCategories(): boolean {
    return true
  }

  getPriorityCrmCategories(): CrmCategoryWithBuilding[] {
    return this.getPriorities()
      .map((building) => {
        switch (building) {
          case Building.BUILDING_1:
            return { crmCategory: this.building1CrmCategory, building: building }
          case Building.BUILDING_2:
            return { crmCategory: this.building2CrmCategory, building: building }
          case Building.BUILDING_3:
            return { crmCategory: this.building3CrmCategory, building: building }
        }
      })
      .filter((it) => !!it?.crmCategory?.code)
  }
}
