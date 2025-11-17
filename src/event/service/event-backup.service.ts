import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { EventBackup } from "@root/event/entities/event-backup.entity"
import { EventService } from "@root/event/service/event.service"
import { EventBackupBundle } from "@root/event/entities/event-backup-bundle.entity"
import { paginate } from "@root/shared/pagination"
import { EventBackupQueryDto } from "@root/event/dto/event-backup-query.dto"
import { EventBackupBundleService } from "@root/event/service/event-backup-bundle.service"
import { CreateEventBackupDto, UpdateEventBackupDto } from "@root/event/dto/event-backup.dto"
import { EventCategoryService } from "@root/event/service/event-category.service"
import { ProductDetailPageService } from "@root/product/service/product-detail-page.service"
import { IntegratedCrmCategoryService } from "@root/smart-doctor/service/integrated-crm-category.service"
import { User } from "@root/shared/interface/user"

@Injectable()
export class EventBackupService {
  constructor(
    @InjectRepository(EventBackup) private repository: Repository<EventBackup>,
    @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
    @Inject(forwardRef(() => EventCategoryService)) private readonly eventCategoryService: EventCategoryService,
    @Inject(forwardRef(() => ProductDetailPageService))
    private readonly productDetailPageService: ProductDetailPageService,
    @Inject(forwardRef(() => IntegratedCrmCategoryService))
    private readonly integratedCrmCategoryService: IntegratedCrmCategoryService,
    @Inject(forwardRef(() => EventBackupBundleService))
    private readonly eventBackupBundleService: EventBackupBundleService,
  ) {}

  async backup(backupBundle: EventBackupBundle, eventBundleId: string) {
    const events = await this.eventService.findByBundleId(eventBundleId)
    await Promise.all(
      events.map(async (event) => {
        return await this.repository.save(
          Object.assign(new EventBackup(), {
            backupBundle: backupBundle,
            category: event.category,
            detailPage: event.detailPage,
            integratedCrmCategory: event.integratedCrmCategory,
            name: event.name,
            nameEN: event.nameEN,
            nameZH: event.nameZH,
            nameZHTW: event.nameZHTW,
            nameJA: event.nameJA,
            nameTH: event.nameTH,
            description: event.description,
            descriptionEN: event.descriptionEN,
            descriptionZH: event.descriptionZH,
            descriptionZHTW: event.descriptionZHTW,
            descriptionJA: event.descriptionJA,
            descriptionTH: event.descriptionTH,
            price: event.price,
            order: event.order,
            orderEN: event.orderEN,
            orderZH: event.orderZH,
            orderZHTW: event.orderZHTW,
            orderJA: event.orderJA,
            orderTH: event.orderTH,
            visible: event.visible,
            visibleEN: event.visibleEN,
            visibleZH: event.visibleZH,
            visibleZHTW: event.visibleZHTW,
            visibleJA: event.visibleJA,
            visibleTH: event.visibleTH,
            label: event.label,
          }),
        )
      }),
    )
  }

  async create(dto: CreateEventBackupDto) {
    const backupBundle = dto.backupBundleId
      ? await this.eventBackupBundleService.findOne(dto.backupBundleId)
      : undefined
    const category = dto.categoryId ? await this.eventCategoryService.findOne(dto.categoryId) : undefined
    const detailPage = dto.detailPageId ? await this.productDetailPageService.findOne(dto.detailPageId) : undefined
    const integratedCrmCategory = dto.integratedCrmCategoryId
      ? await this.integratedCrmCategoryService.findOne(dto.integratedCrmCategoryId)
      : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(backupBundle && { backupBundle: backupBundle }),
        ...(category && { category: category }),
        ...(detailPage && { detailPage: detailPage }),
        ...(integratedCrmCategory && { integratedCrmCategory: integratedCrmCategory }),
      }),
    )
  }

  async update(id: string, dto: UpdateEventBackupDto, user?: User) {
    const event = await this.findOne(id)
    const backupBundle = dto.backupBundleId
      ? await this.eventBackupBundleService.findOne(dto.backupBundleId)
      : undefined
    const category = dto.categoryId ? await this.eventCategoryService.findOne(dto.categoryId) : undefined
    const detailPage = dto.detailPageId ? await this.productDetailPageService.findOne(dto.detailPageId) : undefined
    const integratedCrmCategory = dto.integratedCrmCategoryId
      ? await this.integratedCrmCategoryService.findOne(dto.integratedCrmCategoryId)
      : undefined
    return this.repository.save(
      Object.assign(event, dto, {
        updatedBy: user?.id,
        ...(backupBundle && { backupBundle: backupBundle }),
        ...(category && { category: category }),
        ...(detailPage && { detailPage: detailPage }),
        ...(integratedCrmCategory && { integratedCrmCategory: integratedCrmCategory }),
      }),
    )
  }

  async findManyWithPaginationQuery(query?: EventBackupQueryDto) {
    const findOptions = <FindManyOptions<EventBackup>>{
      where: {
        ...(query?.backupBundleId && { backupBundle: { id: query.backupBundleId } }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<EventBackup>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAllByBackupBundleId(backupBundleId: string) {
    return this.repository.find({ where: { backupBundle: { id: backupBundleId } } })
  }

  async removeByBundleId(backupBundleId: string) {
    const backups = await this.findAllByBackupBundleId(backupBundleId)
    return this.repository.remove(backups)
  }

  async remove(id: string) {
    const backup = await this.findOne(id)
    return this.repository.remove(backup)
  }
}
