import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { Event } from "@root/event/entities/event.entity"

@Entity()
export class EventBundle extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ nullable: true })
  name?: string

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: false })
  postStartDate: Date

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: false })
  postEndDate: Date

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: false })
  startDate: Date

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: false })
  endDate: Date

  @ApiProperty()
  @Column({ nullable: true })
  order?: number

  @ApiProperty()
  @Column({ nullable: true, default: false })
  visibleFirst?: boolean

  @ApiProperty()
  @Column({ nullable: true, default: false })
  visibleSecond?: boolean

  @ApiProperty()
  @OneToMany(() => Event, (event) => event.bundle, { eager: true })
  events?: Event[]
}
