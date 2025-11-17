import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { CreateSpecificDateDto, UpdateSpecificDateDto } from "@root/reservation/dto/specific-date.dto"
import { SpecificDateQueryDto } from "@root/reservation/dto/specific-date-query.dto"
import { SpecificDate } from "@root/reservation/entities/specific-date.entity"
import { SpecificDateSlotService } from "@root/reservation/service/specific-date-slot.service"

@Injectable()
export class SpecificDateService {
  constructor(
    @InjectRepository(SpecificDate) private repository: Repository<SpecificDate>,
    @Inject(forwardRef(() => SpecificDateSlotService))
    private readonly specificDateSlotService: SpecificDateSlotService,
  ) {}

  async create(dto: CreateSpecificDateDto) {
    const date = new Date(dto.date)
    dto.date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    const specificDate = await this.repository.save(dto)
    await this.specificDateSlotService.bulkCreateOrUpdate(specificDate, dto.slots)
    return specificDate
  }

  async findManyWithPaginationQuery(query?: SpecificDateQueryDto) {
    const findOptions = <FindManyOptions<SpecificDate>>{
      where: {},
      order: query.orderByOptions(),
    }
    return await paginate<SpecificDate>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findSlotsByDatetime(datetime: Date) {
    const fixedDatetime = new Date(datetime)
    const date = new Date(fixedDatetime.getFullYear(), fixedDatetime.getMonth(), fixedDatetime.getDate(), 0, 0, 0)
    const specificDates = await this.repository.find({ where: { date: date } })
    const specificDateIds = specificDates.map((item) => item.id)
    return await this.specificDateSlotService.findManyBySpecificDateIdsAndHourAndMinutes(
      specificDateIds,
      fixedDatetime.getHours(),
      fixedDatetime.getMinutes(),
    )
  }

  async findSlotsByDay(day: Date) {
    const fixedDatetime = new Date(day)
    const date = new Date(fixedDatetime.getFullYear(), fixedDatetime.getMonth(), fixedDatetime.getDate(), 0, 0, 0)
    const specificDates = await this.repository.find({ where: { date: date } })
    const specificDateIds = specificDates.map((item) => item.id)
    return await this.specificDateSlotService.findManyBySpecificDateIds(specificDateIds)
  }

  async update(id: string, dto: UpdateSpecificDateDto, user?: User) {
    const specificDate = await this.findOne(id)
    if (dto.date) {
      const date = new Date(dto.date)
      dto.date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    }
    if (dto.slots) {
      await this.specificDateSlotService.bulkCreateOrUpdate(specificDate, dto.slots)
    }
    return this.repository.update(specificDate.id, {
      updatedBy: user?.id,
      ...(dto.date && { date: dto.date }),
      ...(dto.memo && { memo: dto.memo }),
    })
  }

  async remove(id: string) {
    const specificDate = await this.findOne(id)
    await this.specificDateSlotService.removeBySpecificDateId(specificDate.id)
    return this.repository.remove(specificDate)
  }
}
