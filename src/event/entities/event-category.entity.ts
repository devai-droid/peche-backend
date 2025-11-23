import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { EventCategoryStatus } from "@root/shared/enum/event"
import { IsInt, Max, Min } from "class-validator"
import { FileObject } from "@root/file/entities/file-object.entity"

@Entity()
export class EventCategory extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: EventCategoryStatus, nullable: false, default: EventCategoryStatus.ACTIVE })
  status?: EventCategoryStatus

  @ApiProperty()
  @Column({ nullable: true })
  name?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  description?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionTH?: string

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  startDate: Date

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  endDate: Date

  @ApiProperty()
  @Column("int", { array: true, nullable: false, default: [] })
  dayOfWeek?: number[]

  @ApiProperty()
  @Column({ nullable: true })
  @IsInt()
  @Min(0)
  @Max(23)
  startHour?: number

  @ApiProperty()
  @Column({ nullable: true })
  @IsInt()
  @Min(0)
  @Max(30)
  startMinute?: number

  @ApiProperty()
  @Column({ nullable: true })
  @IsInt()
  @Min(0)
  @Max(23)
  endHour?: number

  @ApiProperty()
  @Column({ nullable: true })
  @IsInt()
  @Min(0)
  @Max(30)
  endMinute?: number

  @ApiProperty()
  @Column({ nullable: true })
  order?: number

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  image?: FileObject

  @ApiProperty()
  @Column({ nullable: true })
  minPrice: number

  @ApiProperty()
  @Column({ nullable: true })
  discountPercent: number
}
