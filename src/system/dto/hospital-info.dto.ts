import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { HospitalInfo } from "@root/system/entities/hospital-info.entity"

export interface HospitalInfoDto {
  buildingOneFirstAddress?: string
  buildingOneFirstAddressEN?: string
  buildingOneFirstAddressZH?: string
  buildingOneFirstAddressJA?: string
  buildingOneFirstAddressTH?: string
  buildingOneSecondAddress?: string
  buildingOneSecondAddressEN?: string
  buildingOneSecondAddressZH?: string
  buildingOneSecondAddressJA?: string
  buildingOneSecondAddressTH?: string
  buildingTwoAddress?: string
  buildingTwoAddressEN?: string
  buildingTwoAddressZH?: string
  buildingTwoAddressJA?: string
  buildingTwoAddressTH?: string
  buildingThreeAddress?: string
  buildingThreeAddressEN?: string
  buildingThreeAddressZH?: string
  buildingThreeAddressJA?: string
  buildingThreeAddressTH?: string
  buildingOneFirstAddressDirections?: string
  buildingOneFirstAddressDirectionsEN?: string
  buildingOneFirstAddressDirectionsZH?: string
  buildingOneFirstAddressDirectionsJA?: string
  buildingOneFirstAddressDirectionsTH?: string
  buildingOneSecondAddressDirections?: string
  buildingOneSecondAddressDirectionsEN?: string
  buildingOneSecondAddressDirectionsZH?: string
  buildingOneSecondAddressDirectionsJA?: string
  buildingOneSecondAddressDirectionsTH?: string
  buildingTwoAddressDirections?: string
  buildingTwoAddressDirectionsEN?: string
  buildingTwoAddressDirectionsZH?: string
  buildingTwoAddressDirectionsJA?: string
  buildingTwoAddressDirectionsTH?: string
  buildingThreeAddressDirections?: string
  buildingThreeAddressDirectionsEN?: string
  buildingThreeAddressDirectionsZH?: string
  buildingThreeAddressDirectionsJA?: string
  buildingThreeAddressDirectionsTH?: string
  parkingInfo?: string
  parkingInfoEN?: string
  parkingInfoZH?: string
  parkingInfoJA?: string
  parkingInfoTH?: string
  mondayHours?: string
  tuesdayHours?: string
  wednesdayHours?: string
  thursdayHours?: string
  fridayHours?: string
  saturdayHours?: string
  sundayHours?: string
  confirmationEmail?: string
  confirmationEmailBuildingTwo?: string
  confirmationEmailBuildingThree?: string
  confirmationEmailEN?: string
  confirmationEmailENBuildingTwo?: string
  confirmationEmailENBuildingThree?: string
  confirmationEmailZH?: string
  confirmationEmailZHBuildingTwo?: string
  confirmationEmailZHBuildingThree?: string
  confirmationEmailJA?: string
  confirmationEmailJABuildingTwo?: string
  confirmationEmailJABuildingThree?: string
  confirmationEmailTH?: string
  confirmationEmailTHBuildingTwo?: string
  confirmationEmailTHBuildingThree?: string
}

export class CreateHospitalInfoDto implements HospitalInfoDto {
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddress?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddress?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddress?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddress?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirections?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirectionsEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirectionsZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirectionsJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirectionsTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirections?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirectionsEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirectionsZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirectionsJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirectionsTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirections?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirectionsEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirectionsZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirectionsJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirectionsTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirections?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirectionsEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirectionsZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirectionsJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirectionsTH?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfo?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfoEN?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfoZH?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfoJA?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfoTH?: string
  @ApiPropertyOptional() @IsOptional() readonly mondayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly tuesdayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly wednesdayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly thursdayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly fridayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly saturdayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly sundayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmail?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailBuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailBuildingThree?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailEN?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailENBuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailENBuildingThree?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailZH?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailZHBuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailZHBuildingThree?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailJA?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailJABuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailJABuildingThree?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailTH?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailTHBuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailTHBuildingThree?: string
}

export class UpdateHospitalInfoDto implements HospitalInfoDto {
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddress?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddress?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddress?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddress?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirections?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirectionsEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirectionsZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirectionsJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneFirstAddressDirectionsTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirections?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirectionsEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirectionsZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirectionsJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingOneSecondAddressDirectionsTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirections?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirectionsEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirectionsZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirectionsJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingTwoAddressDirectionsTH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirections?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirectionsEN?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirectionsZH?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirectionsJA?: string
  @ApiPropertyOptional() @IsOptional() readonly buildingThreeAddressDirectionsTH?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfo?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfoEN?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfoZH?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfoJA?: string
  @ApiPropertyOptional() @IsOptional() readonly parkingInfoTH?: string
  @ApiPropertyOptional() @IsOptional() readonly mondayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly tuesdayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly wednesdayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly thursdayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly fridayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly saturdayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly sundayHours?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmail?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailBuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailBuildingThree?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailEN?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailENBuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailENBuildingThree?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailZH?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailZHBuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailZHBuildingThree?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailJA?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailJABuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailJABuildingThree?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailTH?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailTHBuildingTwo?: string
  @ApiPropertyOptional() @IsOptional() readonly confirmationEmailTHBuildingThree?: string
}

export class HospitalInfoList extends Paginated {
  @ApiProperty({ type: () => HospitalInfo, isArray: true })
  items: HospitalInfo[]
}
