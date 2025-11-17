import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { SpecificDateSlot } from "@root/reservation/entities/specific-date-slot.entity"
import { In, Repository } from "typeorm"
import { SpecificDate } from "@root/reservation/entities/specific-date.entity"
import { SpecificDateSlotDto } from "@root/reservation/dto/specific-date.dto"
import { Building } from "@root/shared/enum/category"

@Injectable()
export class SpecificDateSlotService {
  constructor(@InjectRepository(SpecificDateSlot) private repository: Repository<SpecificDateSlot>) {}

  async createOrUpdate(specificDate: SpecificDate, dto: SpecificDateSlotDto) {
    const specificDateSlot = await this.findOneBySpecificDateIdAndBuildingAndHourAndMinutes(
      specificDate.id,
      dto.building,
      dto.hour,
      dto.minutes,
    )
    if (specificDateSlot) {
      return await this.repository.save(Object.assign(specificDateSlot, { maxSlot: dto.maxSlot }))
    }
    return await this.repository.save(
      Object.assign(new SpecificDateSlot(), {
        specificDate: specificDate,
        building: dto.building,
        hour: dto.hour,
        minutes: dto.minutes,
        maxSlot: dto.maxSlot,
      }),
    )
  }
  async bulkCreateOrUpdate(specificDate: SpecificDate, dto: SpecificDateSlotDto[]) {
    return Promise.all(dto.map(async (item) => await this.createOrUpdate(specificDate, item)))
  }

  async findOneBySpecificDateIdAndBuildingAndHourAndMinutes(
    specificDateId: string,
    building: Building,
    hour: number,
    minutes: number,
  ) {
    return await this.repository.findOne({
      where: { specificDate: { id: specificDateId }, building: building, hour: hour, minutes: minutes },
    })
  }

  async findManyBySpecificDateId(specificDateId: string) {
    return await this.repository.find({ where: { specificDate: { id: specificDateId } } })
  }

  async findManyBySpecificDateIds(specificDateIds: string[]) {
    return await this.repository.find({ where: { specificDate: { id: In(specificDateIds) } } })
  }

  async findManyBySpecificDateIdsAndHourAndMinutes(specificDateIds: string[], hour: number, minutes: number) {
    return await this.repository.find({
      where: { specificDate: { id: In(specificDateIds) }, hour: hour, minutes: minutes },
    })
  }

  async removeBySpecificDateId(specificDateId: string) {
    const specificDateSlots = await this.findManyBySpecificDateId(specificDateId)
    return await this.repository.remove(specificDateSlots)
  }
}
