import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { Building } from "@root/shared/enum/category"
import { ApiProperty } from "@nestjs/swagger"
import { DaysOfWeek } from "@root/shared/enum/reservation"

@Entity()
export class ReservationSlot extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ nullable: false })
  building: Building

  @ApiProperty()
  @Column({ type: "enum", enum: DaysOfWeek, nullable: false })
  dayOfWeek: DaysOfWeek

  @ApiProperty()
  @Column({ nullable: false })
  hour: number

  @ApiProperty()
  @Column({ nullable: false, default: 0 })
  minutes: number

  @ApiProperty()
  @Column({ nullable: false, default: 0 })
  maxSlot: number
}
