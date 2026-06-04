import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { AccountUser } from "@root/users/entities/user.entity"
import { ReservationStatus } from "@root/shared/enum/reservation"
import { Building } from "@root/shared/enum/category"
import { ReservationProduct } from "@root/reservation/entities/reservation-product.entity"
import { ReservationEvent } from "@root/reservation/entities/reservation-event.entity"
import { IntegratedCrmCategory } from "@root/smart-doctor/entities/integrated-crm-category.entity"
import { LangCrmCategory } from "@root/smart-doctor/entities/lang-crm-category.entity"

@Entity()
export class Reservation extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ nullable: true })
  rid?: string

  @ApiProperty()
  @ManyToOne(() => AccountUser, { nullable: false, eager: true })
  @JoinColumn()
  user?: AccountUser

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  datetime: Date

  @ApiProperty()
  @Column({ type: "enum", enum: ReservationStatus, nullable: false, default: ReservationStatus.WAITING })
  status?: ReservationStatus

  @ApiProperty()
  @ManyToOne(() => IntegratedCrmCategory, { nullable: true, eager: true })
  @JoinColumn()
  integratedCrmCategory?: IntegratedCrmCategory

  @ApiProperty()
  @ManyToOne(() => LangCrmCategory, { nullable: true, eager: true })
  @JoinColumn()
  langCrmCategory?: LangCrmCategory

  @ApiProperty({ type: ReservationProduct, isArray: true })
  @OneToMany(() => ReservationProduct, (reservationProduct) => reservationProduct.reservation, {
    nullable: true,
    eager: true,
  })
  products?: ReservationProduct[]

  @ApiProperty({ type: ReservationEvent, isArray: true })
  @OneToMany(() => ReservationEvent, (reservationEvent) => reservationEvent.reservation, {
    nullable: true,
    eager: true,
  })
  events?: ReservationEvent[]

  @ApiProperty()
  @Column({ nullable: true })
  userMemo?: string

  @ApiProperty()
  @Column({ nullable: true })
  adminMemo?: string

  @ApiProperty()
  @Column({ nullable: true })
  building?: Building

  @ApiProperty()
  @Column({ nullable: true })
  pathVisit?: string

  @ApiProperty()
  @Column({ nullable: true })
  detailVisit?: string

  // 닥터팔레트 plan id 저장
  @ApiProperty()
  @Column({ nullable: true })
  palettePlanId?: string

  // 예약이 생성된 닥터팔레트 스케줄 ID (예약 수정 시 원본 스케줄 유지용)
  @ApiProperty()
  @Column({ nullable: true })
  paletteScheduleId?: string
}
