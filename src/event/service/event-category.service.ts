import { Injectable, Inject, forwardRef } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { EventCategory } from "@root/event/entities/event-category.entity"
import { CreateEventCategoryDto, UpdateEventCategoryDto } from "@root/event/dto/event-category.dto"
import { EventCategoryQueryDto } from "@root/event/dto/event-category-query.dto"
import { EventCategoryStatus } from "@root/shared/enum/event"
import { FileService } from "@root/file/service/files.service"

@Injectable()
export class EventCategoryService {
  constructor(
    @InjectRepository(EventCategory)
    private repository: Repository<EventCategory>,

    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
  ) {}

  async create(dto: CreateEventCategoryDto) {
    // 이미지 처리
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined

    return await this.repository.save({
      ...dto,
      ...(image && { image }),
    })
  }

  async findManyWithPaginationQuery(query?: EventCategoryQueryDto) {
    const findOptions = <FindManyOptions<EventCategory>>{
      where: {
        ...(query?.status && { status: query.status }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<EventCategory>(this.repository, query.paginationOptions(), findOptions)
  }

  async findAllActive() {
    return this.repository.find({
      where: { status: EventCategoryStatus.ACTIVE },
      order: { order: "ASC" },
    })
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id } })
  }

  async findOneByNameOrNull(name: string) {
    const entityName = "event_category"
    const queryBuilder = this.repository.createQueryBuilder(entityName)
    queryBuilder.andWhere(`REPLACE(name, ' ', '') LIKE :name`, { name: name.replaceAll(" ", "") })
    return queryBuilder.getOne()
  }

  async findOrCreateByName(name: string) {
    const existing = await this.findOneByNameOrNull(name)
    if (existing) return existing
    return await this.repository.save({ name })
  }

  async update(id: string, dto: UpdateEventCategoryDto, user?: User) {
    const eventCategory = await this.findOne(id)

    // 이미지 삭제 처리
    if (Object.prototype.hasOwnProperty.call(dto, "imageId") && dto.imageId === null) {
      eventCategory.image = null
    }

    // 이미지 신규 업로드 처리
    if (dto.imageId && dto.imageId !== (eventCategory.image?.id || null)) {
      const image = await this.fileService.findOne(dto.imageId)
      eventCategory.image = image
    }

    return this.repository.save(
      Object.assign(eventCategory, dto, {
        updatedBy: user?.id,
      }),
    )
  }

  async remove(id: string) {
    const eventCategory = await this.findOne(id)
    return this.repository.remove(eventCategory)
  }
}
