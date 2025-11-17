import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"

@Entity()
export class HospitalInfo extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddress?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddressEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddressZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddressJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddressTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddress?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddressEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddressZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddressJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddressTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddress?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddressEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddressZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddressJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddressTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddress?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddressEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddressZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddressJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddressTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddressDirections?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddressDirectionsEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddressDirectionsZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddressDirectionsJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneFirstAddressDirectionsTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddressDirections?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddressDirectionsEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddressDirectionsZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddressDirectionsJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingOneSecondAddressDirectionsTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddressDirections?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddressDirectionsEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddressDirectionsZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddressDirectionsJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingTwoAddressDirectionsTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddressDirections?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddressDirectionsEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddressDirectionsZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddressDirectionsJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  buildingThreeAddressDirectionsTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  parkingInfo?: string

  @ApiProperty()
  @Column({ nullable: true })
  parkingInfoEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  parkingInfoZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  parkingInfoJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  parkingInfoTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  mondayHours?: string

  @ApiProperty()
  @Column({ nullable: true })
  tuesdayHours?: string

  @ApiProperty()
  @Column({ nullable: true })
  wednesdayHours?: string

  @ApiProperty()
  @Column({ nullable: true })
  thursdayHours?: string

  @ApiProperty()
  @Column({ nullable: true })
  fridayHours?: string

  @ApiProperty()
  @Column({ nullable: true })
  saturdayHours?: string

  @ApiProperty()
  @Column({ nullable: true })
  sundayHours?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmail?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailBuildingTwo?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailBuildingThree?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailENBuildingTwo?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailENBuildingThree?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailZHBuildingTwo?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailZHBuildingThree?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailJABuildingTwo?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailJABuildingThree?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailTHBuildingTwo?: string

  @ApiProperty()
  @Column({ nullable: true })
  confirmationEmailTHBuildingThree?: string
}
