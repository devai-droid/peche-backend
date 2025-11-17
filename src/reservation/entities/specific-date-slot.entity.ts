import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { Building } from "@root/shared/enum/category"
import { Exclude } from "class-transformer"
import { SpecificDate } from "@root/reservation/entities/specific-date.entity"

@Entity()
export class SpecificDateSlot extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Exclude()
  @ManyToOne(() => SpecificDate, (specificDate) => specificDate.id, { nullable: false })
  @JoinColumn()
  specificDate: SpecificDate

  @ApiProperty()
  @Column({ nullable: false })
  building: Building

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
