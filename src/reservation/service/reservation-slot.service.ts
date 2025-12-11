import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { ReservationSlot } from "@root/reservation/entities/reservation-slot.entity"
import { CreateReservationSlotDto, ReservationSlotDto } from "@root/reservation/dto/reservation-slot.dto"
import { ReservationSlotQueryDto } from "@root/reservation/dto/reservation-slot-query.dto"
import { numberToDayOfWeekString } from "@root/shared/utils"

@Injectable()
export class ReservationSlotService {
  constructor(@InjectRepository(ReservationSlot) private repository: Repository<ReservationSlot>) {}

  async createOrUpdate(dto: CreateReservationSlotDto, user?: User) {
    const reservationSlot = await this.findOneByDtoOrNull(dto)
    if (reservationSlot) {
      return this.repository.save(Object.assign(reservationSlot, dto, { updatedBy: user?.id }))
    }
    return await this.repository.save(dto)
  }

  async bulkCreateOrUpdate(dtos: CreateReservationSlotDto[], user?: User) {
    return await Promise.all(
      dtos.map(async (dto) => {
        return await this.createOrUpdate(dto, user)
      }),
    )
  }

  async findManyWithPaginationQuery(query?: ReservationSlotQueryDto) {
    const findOptions = <FindManyOptions<ReservationSlot>>{
      where: {
        ...(query?.building && { building: query.building }),
        ...(query?.dayOfWeek && { dayOfWeek: query.dayOfWeek }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<ReservationSlot>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findOneByDtoOrNull(dto: ReservationSlotDto) {
    return this.repository.findOne({
      where: { building: dto.building, dayOfWeek: dto.dayOfWeek, hour: dto.hour, minutes: dto.minutes },
    })
  }

  async findByDatetime(datetime: Date) {
    const fixedDatetime = new Date(datetime)
    const dayOfWeek = numberToDayOfWeekString(fixedDatetime.getDay())
    return await this.repository.find({
      where: { dayOfWeek: dayOfWeek, hour: fixedDatetime.getHours(), minutes: fixedDatetime.getMinutes() },
    })
  }

  async findByDay(day: Date) {
    const fixedDatetime = new Date(day)
    const dayOfWeek = numberToDayOfWeekString(fixedDatetime.getDay())
    return await this.repository.find({
      where: { dayOfWeek: dayOfWeek },
    })
  }

  async findAll() {
    return await this.repository.find()
  }
}
