import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { CreatedOnlyTimeStampEntity } from "@root/shared/entity/created-only-time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { Exclude } from "class-transformer"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import { Event } from "@root/event/entities/event.entity"

@Entity()
export class ReservationEvent extends CreatedOnlyTimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Exclude()
  @ManyToOne(() => Reservation, (reservation) => reservation.id, { nullable: false })
  @JoinColumn()
  reservation: Reservation

  @ApiProperty({ type: () => Event })
  @ManyToOne(() => Event, (event) => event.id, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  event: Event
}
