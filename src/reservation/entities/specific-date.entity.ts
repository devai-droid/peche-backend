import { ApiProperty } from "@nestjs/swagger"
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { SpecificDateSlot } from "@root/reservation/entities/specific-date-slot.entity"

@Entity()
export class SpecificDate extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  date: Date

  @ApiProperty()
  @Column({ nullable: true })
  memo?: string

  @ApiProperty({ type: () => SpecificDateSlot, isArray: true })
  @OneToMany(() => SpecificDateSlot, (slots) => slots.specificDate, {
    nullable: true,
    eager: true,
  })
  slots?: SpecificDateSlot[]
}
