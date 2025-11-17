import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ReservationEvent } from "@root/reservation/entities/reservation-event.entity"
import { EventService } from "@root/event/service/event.service"
import { Reservation } from "@root/reservation/entities/reservation.entity"

@Injectable()
export class ReservationEventService {
  constructor(
    @InjectRepository(ReservationEvent) private repository: Repository<ReservationEvent>,
    @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
  ) {}

  async bulkCreate(reservation: Reservation, eventIds: string[]) {
    const events = await this.eventService.findManyByIds(eventIds)
    return await this.repository.save(
      events.map((event) => Object.assign(new ReservationEvent(), { reservation: reservation, event: event })),
    )
  }

  async findOneByReservationIdAndEventId(reservationId: string, eventId: string) {
    return await this.repository.findOneOrFail({
      relations: ["reservation", "event"],
      where: { reservation: { id: reservationId }, event: { id: eventId } },
    })
  }

  async findManyByReservationId(reservationId: string) {
    return await this.repository.find({ where: { reservation: { id: reservationId } } })
  }

  async removeByReservationId(reservationId: string) {
    const reservationEvents = await this.findManyByReservationId(reservationId)
    return await this.repository.remove(reservationEvents)
  }

  async removeByReservationIdAndEventId(reservationId: string, eventId: string) {
    const reservationEvent = await this.findOneByReservationIdAndEventId(reservationId, eventId)
    return await this.repository.remove(reservationEvent)
  }
}
