import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, LessThan, MoreThanOrEqual, Repository } from "typeorm"
import { kstDayBounds } from "@root/shared/helper/kst.helper"
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

  async findOrCreateByName(name: string, order?: number) {
    const existing = await this.repository.findOne({ where: { name } })
    if (existing) {
      if (order !== undefined && existing.order !== order) {
        existing.order = order
        await this.repository.save(existing)
      }
      return existing
    }
    const today = new Date()
    const nextYear = new Date(today.getFullYear() + 4, today.getMonth(), today.getDate())
    return await this.repository.save({
      name,
      order,
      postStartDate: today,
      postEndDate: nextYear,
      startDate: today,
      endDate: nextYear,
    })
  }

  // 임포트 동기화 등 내부용: 게시기간과 무관하게 전체 번들 반환
  async findAll() {
    return this.repository.find({ order: { order: "ASC" } })
  }

  // 웹사이트 노출용: 오늘(KST)이 게시기간에 포함되는 번들만 반환.
  // 어드민은 날짜만 지정하므로(저장 시 붙는 시각은 무시) KST "날짜 단위"로 비교.
  async findVisible() {
    const { todayStart, tomorrowStart } = kstDayBounds()
    return this.repository.find({
      where: {
        postStartDate: LessThan(tomorrowStart),
        postEndDate: MoreThanOrEqual(todayStart),
      },
      order: { order: "ASC" },
    })
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
