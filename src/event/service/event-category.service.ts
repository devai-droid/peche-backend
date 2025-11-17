import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { EventCategory } from "@root/event/entities/event-category.entity"
import { CreateEventCategoryDto, UpdateEventCategoryDto } from "@root/event/dto/event-category.dto"
import { EventCategoryQueryDto } from "@root/event/dto/event-category-query.dto"
import { EventCategoryStatus } from "@root/shared/enum/event"

@Injectable()
export class EventCategoryService {
  constructor(@InjectRepository(EventCategory) private repository: Repository<EventCategory>) {}

  async create(dto: CreateEventCategoryDto) {
    return await this.repository.save(dto)
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
    return this.repository.find({ where: { status: EventCategoryStatus.ACTIVE }, order: { order: "ASC" } })
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findOneByNameOrNull(name: string) {
    const entityName = "event_category"
    const queryBuilder = this.repository.createQueryBuilder(entityName)
    queryBuilder.andWhere(`REPLACE(name, ' ', '') LIKE '${name.replaceAll(" ", "")}'`)
    return queryBuilder.getOne()
  }

  async update(id: string, dto: UpdateEventCategoryDto, user?: User) {
    const eventCategory = await this.findOne(id)
    return this.repository.save(Object.assign(eventCategory, dto, { updatedBy: user?.id }))
  }

  async remove(id: string) {
    const eventCategory = await this.findOne(id)
    return this.repository.remove(eventCategory)
  }
}
