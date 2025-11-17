import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { CloseDay } from "@root/reservation/entities/close-day.entity"
import { CreateCloseDayDto, UpdateCloseDayDto } from "@root/reservation/dto/close-day.dto"
import { CloseDayQueryDto } from "@root/reservation/dto/close-day-query.dto"

@Injectable()
export class CloseDayService {
  constructor(@InjectRepository(CloseDay) private repository: Repository<CloseDay>) {}

  async create(dto: CreateCloseDayDto) {
    const date = new Date(dto.date)
    dto.date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    return await this.repository.save(dto)
  }

  async findManyWithPaginationQuery(query?: CloseDayQueryDto) {
    const findOptions = <FindManyOptions<CloseDay>>{
      where: {},
      order: query.orderByOptions(),
    }
    return await paginate<CloseDay>(this.repository, query.paginationOptions(), findOptions)
  }

  async findAllActive() {
    const entityName = "close_day"
    const queryBuilder = this.repository.createQueryBuilder(entityName)
    queryBuilder.andWhere(`${entityName}.date > now()`)
    return queryBuilder.getMany()
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async update(id: string, dto: UpdateCloseDayDto, user?: User) {
    const closeDay = await this.findOne(id)
    if (dto.date) {
      const date = new Date(dto.date)
      dto.date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    }
    return this.repository.save(Object.assign(closeDay, dto, { updatedBy: user?.id }))
  }

  async remove(id: string) {
    const closeDay = await this.findOne(id)
    return this.repository.remove(closeDay)
  }

  async checkIsCloseDay(datetime: Date) {
    const date = new Date(datetime)
    const startDatetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    return await this.repository.exist({ where: { date: startDatetime } })
  }
}
