import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Brackets, FindManyOptions, Repository } from "typeorm"
import { EventBundle } from "@root/event/entities/event-bundle.entity"
import { CreateEventBundleDto, UpdateEventBundleDto } from "@root/event/dto/event-bundle.dto"
import { paginate } from "@root/shared/pagination"
import { EventBundleQueryDto } from "@root/event/dto/event-bundle-query.dto"
import { EventService } from "@root/event/service/event.service"

@Injectable()
export class EventBundleService {
  constructor(
    @InjectRepository(EventBundle) private repository: Repository<EventBundle>,
    @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
  ) {}

  async create(dto: CreateEventBundleDto) {
    const today = new Date()
    const nextMonthYear = today.getMonth() == 11 ? today.getFullYear() + 1 : today.getFullYear()
    const nextMonth = today.getMonth() == 11 ? 0 : today.getMonth() + 1
    const startDate = new Date(nextMonthYear, nextMonth, 1)
    const endDate = new Date(nextMonthYear, nextMonth, 30)
    return await this.repository.save(
      Object.assign(dto, { postStartDate: startDate, postEndDate: endDate, startDate: startDate, endDate: endDate }),
    )
  }

  async findManyWithPaginationQuery(query?: EventBundleQueryDto) {
    const findOptions = <FindManyOptions<EventBundle>>{
      where: {},
      order: query.orderByOptions(),
    }
    return await paginate<EventBundle>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findVisible() {
    const entityName = "event_bundle"
    const queryBuilder = this.repository.createQueryBuilder(entityName)
    queryBuilder.andWhere(
      new Brackets((sqb) => {
        sqb.where(`${entityName}.postStartDate < now()`).andWhere(`${entityName}.postEndDate > now()`)
      }),
    )
    return queryBuilder.getMany()
  }

  async update(id: string, dto: UpdateEventBundleDto) {
    const eventBundle = await this.findOne(id)
    if (dto.visibleFirst) {
      await this.repository.update({ visibleFirst: true }, { visibleFirst: false })
    }
    if (dto.visibleSecond) {
      await this.repository.update({ visibleSecond: true }, { visibleSecond: false })
    }
    return this.repository.save(
      Object.assign(eventBundle, {
        ...(dto.name && { name: dto.name }),
        ...(dto.postStartDate && { postStartDate: dto.postStartDate }),
        ...(dto.postEndDate && { postEndDate: dto.postEndDate }),
        ...(dto.startDate && { startDate: dto.startDate }),
        ...(dto.endDate && { endDate: dto.endDate }),
        ...(dto.visibleFirst !== undefined && { visibleFirst: dto.visibleFirst }),
        ...(dto.visibleSecond !== undefined && { visibleSecond: dto.visibleSecond }),
      }),
    )
  }

  async remove(id: string) {
    const eventBundle = await this.findOne(id)
    await this.eventService.removeByBundleId(eventBundle.id)
    return this.repository.remove(eventBundle)
  }
}
