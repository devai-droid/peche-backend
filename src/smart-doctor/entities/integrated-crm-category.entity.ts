import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { CrmCategory } from "@root/smart-doctor/entities/crm-category.entity"
import { Building } from "@root/shared/enum/category"
import { CategoryGroup, CrmCategoryWithBuilding } from "@root/smart-doctor/entities/category-group"

@Entity()
export class IntegratedCrmCategory extends TimeStampEntity implements CategoryGroup {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

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

  @ApiProperty()
  @Column({ type: "enum", enum: Building, nullable: true })
  firstPriorityBuilding?: Building

  @ApiProperty()
  @Column({ type: "enum", enum: Building, nullable: true })
  secondPriorityBuilding?: Building

  @ApiProperty()
  @Column({ nullable: true })
  order?: number

  getPriorities(): Building[] {
    const third = [Building.BUILDING_1, Building.BUILDING_2, Building.BUILDING_3].find(
      (it) => it !== this.firstPriorityBuilding && it !== this.secondPriorityBuilding,
    )
    return [this.firstPriorityBuilding, this.secondPriorityBuilding, third]
  }

  isActivated(): boolean {
    return true
  }

  isLangCategories(): boolean {
    return false
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
