import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Event } from "@root/event/entities/event.entity"
import { ILike, In, Repository, Brackets } from "typeorm"
import { ProductDetailPageService } from "@root/product/service/product-detail-page.service"
import { IntegratedCrmCategoryService } from "@root/smart-doctor/service/integrated-crm-category.service"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { EventCategoryService } from "./event-category.service"
import {
  CreateEventDto,
  CreateEventFromGoogleSpreadsheetDto,
  ImportFromGoogleSpreadsheetEventDto,
  UpdateEventDto,
} from "@root/event/dto/event.dto"
import { EventQueryDto } from "@root/event/dto/event-query.dto"
import { EventBundleService } from "@root/event/service/event-bundle.service"
import { EventBackup } from "@root/event/entities/event-backup.entity"
import { GoogleSpreadsheetHelper } from "@root/shared/helper/google-spreadsheet.helper"
import { EventCategoryStatus } from "@root/shared/enum/event"
import { kstDayBounds } from "@root/shared/helper/kst.helper"

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event) private repository: Repository<Event>,
    @Inject(forwardRef(() => EventBundleService)) private readonly eventBundleService: EventBundleService,
    @Inject(forwardRef(() => EventCategoryService)) private readonly eventCategoryService: EventCategoryService,
    @Inject(forwardRef(() => ProductDetailPageService))
    private readonly productDetailPageService: ProductDetailPageService,
    @Inject(forwardRef(() => IntegratedCrmCategoryService))
    private readonly integratedCrmCategoryService: IntegratedCrmCategoryService,
  ) {}

  async create(dto: CreateEventDto) {
    const bundle = dto.bundleId ? await this.eventBundleService.findOne(dto.bundleId) : undefined
    const category = dto.categoryId ? await this.eventCategoryService.findOne(dto.categoryId) : undefined
    const detailPage = dto.detailPageId ? await this.productDetailPageService.findOne(dto.detailPageId) : undefined
    const integratedCrmCategory = dto.integratedCrmCategoryId
      ? await this.integratedCrmCategoryService.findOne(dto.integratedCrmCategoryId)
      : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(bundle && { bundle: bundle }),
        ...(category && { category: category }),
        ...(detailPage && { detailPage: detailPage }),
        ...(integratedCrmCategory && { integratedCrmCategory: integratedCrmCategory }),
      }),
    )
  }

  async createFromGoogleSpreadsheet(dto: CreateEventFromGoogleSpreadsheetDto) {
    const bundle = dto.bundleId ? await this.eventBundleService.findOne(dto.bundleId) : undefined
    const category = dto.categoryName
      ? await this.eventCategoryService.findOrCreateByName(dto.categoryName)
      : undefined
    const detailPage = dto.detailPageName
      ? await this.productDetailPageService.findOneByNameOrNull(dto.detailPageName)
      : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(bundle && { bundle: bundle }),
        ...(category && { category: category }),
        ...(detailPage && { detailPage: detailPage }),
      }),
    )
  }

  async bulkCreateByBackup(bundleId: string, backups: EventBackup[]) {
    const bundle = await this.eventBundleService.findOne(bundleId)
    return await this.repository.save(
      backups.map((backup) => {
        return Object.assign(backup, { bundle: bundle })
      }),
    )
  }

  async findManyWithPaginationQuery(query?: EventQueryDto) {
    const qb = this.repository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.bundle", "bundle")
      .where("1 = 1")

    // bundle 게시기간 필터: 오늘(KST) 날짜 단위로 비교 (null이면 무제한). 어드민은 includeExpired=true 로 우회
    if (!query?.includeExpired) {
      const { todayStart, tomorrowStart } = kstDayBounds()
      qb.andWhere("(bundle.post_start_date IS NULL OR bundle.post_start_date < :tomorrowStart)", { tomorrowStart })
      qb.andWhere("(bundle.post_end_date IS NULL OR bundle.post_end_date >= :todayStart)", { todayStart })
    }

    if (query?.bundleId) qb.andWhere("bundle.id = :bundleId", { bundleId: query.bundleId })
    if (query?.categoryId) qb.andWhere('event."category_id" = :categoryId', { categoryId: query.categoryId })
    if (query?.detailPageId)
      qb.andWhere('event."detail_page_id" = :detailPageId', { detailPageId: query.detailPageId })
    if (query?.integratedCrmCategoryId)
      qb.andWhere('event."integrated_crm_category_id" = :icId', { icId: query.integratedCrmCategoryId })
    if (query?.visible !== undefined) qb.andWhere("event.visible = :v", { v: query.visible })
    if (query?.visibleEN !== undefined) qb.andWhere('event."visible_en" = :vEN', { vEN: query.visibleEN })
    if (query?.visibleZH !== undefined) qb.andWhere('event."visible_zh" = :vZH', { vZH: query.visibleZH })
    if (query?.visibleZHTW !== undefined)
      qb.andWhere('event."visible_zhtw" = :vZHTW', { vZHTW: query.visibleZHTW })
    if (query?.visibleJA !== undefined) qb.andWhere('event."visible_ja" = :vJA', { vJA: query.visibleJA })
    if (query?.visibleTH !== undefined) qb.andWhere('event."visible_th" = :vTH', { vTH: query.visibleTH })

    qb.orderBy("bundle.order", "ASC").addOrderBy("event.order", "ASC")

    return await paginate<Event>(qb, query.paginationOptions())
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAll() {
    return this.repository.find()
  }

  async findByBundleId(bundleId: string) {
    return this.repository.find({ where: { bundle: { id: bundleId } } })
  }

  async findManyByIds(ids: string[]) {
    return this.repository.find({ relations: ["bundle", "category"], where: { id: In(ids) } })
  }

  async findManyByQuery(query: string) {
    const queryBuilder = this.repository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.bundle", "bundle")
      .leftJoinAndSelect("event.detailPage", "detailPage")
      .where(
        new Brackets((qb) => {
          qb.where("event.name ILIKE :query", { query: `%${query}%` })
            .orWhere("event.nameEN ILIKE :query", { query: `%${query}%` })
            .orWhere("event.nameJA ILIKE :query", { query: `%${query}%` })
            .orWhere("event.nameZH ILIKE :query", { query: `%${query}%` })
            .orWhere("event.nameZHTW ILIKE :query", { query: `%${query}%` })
            .orWhere("event.nameTH ILIKE :query", { query: `%${query}%` })
            .orWhere("event.description ILIKE :query", { query: `%${query}%` })
            .orWhere("event.descriptionEN ILIKE :query", { query: `%${query}%` })
            .orWhere("event.descriptionJA ILIKE :query", { query: `%${query}%` })
            .orWhere("event.descriptionZH ILIKE :query", { query: `%${query}%` })
            .orWhere("event.descriptionZHTW ILIKE :query", { query: `%${query}%` })
            .orWhere("event.descriptionTH ILIKE :query", { query: `%${query}%` })
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where("bundle.visibleFirst = true").orWhere("bundle.visibleSecond = true")
        }),
      )

    return queryBuilder.getMany()
  }

  async update(id: string, dto: UpdateEventDto, user?: User) {
    const event = await this.findOne(id)
    const bundle = dto.bundleId ? await this.eventBundleService.findOne(dto.bundleId) : undefined
    const category = dto.categoryId ? await this.eventCategoryService.findOne(dto.categoryId) : undefined
    const detailPage = dto.detailPageId ? await this.productDetailPageService.findOne(dto.detailPageId) : undefined
    const integratedCrmCategory = dto.integratedCrmCategoryId
      ? await this.integratedCrmCategoryService.findOne(dto.integratedCrmCategoryId)
      : undefined
    return this.repository.save(
      Object.assign(event, dto, {
        updatedBy: user?.id,
        ...(bundle && { bundle: bundle }),
        ...(category && { category: category }),
        ...(detailPage && { detailPage: detailPage }),
        ...(integratedCrmCategory && { integratedCrmCategory: integratedCrmCategory }),
      }),
    )
  }

  async remove(id: string) {
    const event = await this.findOne(id)
    return this.repository.remove(event)
  }

  async removeByBundleId(bundleId: string) {
    const events = await this.findByBundleId(bundleId)
    return this.repository.remove(events)
  }

  async importFromGoogleSpreadsheet(dto: ImportFromGoogleSpreadsheetEventDto) {
    // 해당 번들의 기존 이벤트 전체 삭제
    await this.removeByBundleId(dto.bundleId)

    // 시트에서 새 이벤트 생성
    const events = await GoogleSpreadsheetHelper.getEventsFromSpreadsheet(dto.url, dto.bundleId)
    if (events.length === 0) return []

    const createdEvents = await Promise.all(
      events.map(async (dto) => {
        return await this.createFromGoogleSpreadsheet(dto)
      }),
    )

    return createdEvents
  }

  async importFromGoogleSpreadsheetAllSheets(dto: { url: string }) {
    const sheets = await GoogleSpreadsheetHelper.getEventsFromAllSheets(dto.url)
    const sheetBundleNames = new Set(sheets.map((s) => s.sheetName))

    // 시트에 없는 기존 번들은 통째로 삭제 (시트 = SSOT)
    // 게시기간 지난 번들도 삭제 대상 판단에 포함해야 하므로 findAll(전체) 사용
    const existingBundles = await this.eventBundleService.findAll()
    for (const bundle of existingBundles) {
      if (!sheetBundleNames.has(bundle.name)) {
        await this.eventBundleService.remove(bundle.id)
      }
    }

    const allCreatedEvents = []

    for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex++) {
      const { sheetName, events } = sheets[sheetIndex]
      // 탭 이름으로 번들 찾거나 생성 + 탭 순서 반영
      const bundle = await this.eventBundleService.findOrCreateByName(sheetName, sheetIndex)

      // 해당 번들의 기존 이벤트 삭제
      await this.removeByBundleId(bundle.id)

      // 이벤트 생성 (bundleId 설정)
      const createdEvents = await Promise.all(
        events.map(async (eventDto) => {
          eventDto.bundleId = bundle.id
          return await this.createFromGoogleSpreadsheet(eventDto)
        }),
      )

      allCreatedEvents.push(...createdEvents)
    }

    return allCreatedEvents
  }

  async checkAvailableEvents(ids: string[], reservationDate: Date) {
    const events = await this.repository.find({ relations: ["bundle", "category"], where: { id: In(ids) } })
    const date = new Date(reservationDate)
    date.setHours(0, 0, 0, 0)
    const datetime = new Date(reservationDate)
    const { todayStart, tomorrowStart } = kstDayBounds()
    return events.filter((event) => {
      return (
        // 예약 가능 기준: 방문일이 아니라 "오늘(KST)이 이 이벤트의 노출(게시)기간 안인지"로 판단
        // → 노출 중이면 방문일(내원일)은 자유. 노출이 끝났으면 예약 불가.
        event.bundle.postStartDate < tomorrowStart &&
        event.bundle.postEndDate >= todayStart &&
        event.category.dayOfWeek.includes(date.getDay()) &&
        (event.category.startDate == undefined || event.category.startDate <= date) &&
        (event.category.endDate == undefined || date <= event.category.endDate) &&
        (event.category.startHour == undefined ||
          event.category.startHour < datetime.getUTCHours() ||
          (event.category.startHour == datetime.getUTCHours() &&
            (event.category.startMinute == undefined || event.category.startMinute <= datetime.getMinutes()))) &&
        (event.category.endHour == undefined ||
          datetime.getUTCHours() < event.category.endHour ||
          (event.category.endHour == datetime.getUTCHours() &&
            (event.category.endMinute == undefined || event.category.endMinute >= datetime.getMinutes()))) &&
        event.category.status == EventCategoryStatus.ACTIVE
      )
    })
  }
}
