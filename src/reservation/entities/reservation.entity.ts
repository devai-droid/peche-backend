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

/**
 * 예약 당시 상품/이벤트 스냅샷 1건. 상품 재임포트(삭제+재생성)·가격변경과 무관하게 이력을 보존한다.
 * name=표시명(이벤트는 '[대분류] 이벤트명'), price=예약 당시 단가(할인가 우선), count=수량.
 */
export interface ReservationItemSnapshot {
  name: string
  price: number
  count: number
}

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

  // 예약 당시 상품/이벤트 스냅샷(이름·가격·수량). 재임포트·가격변경에도 이력 보존.
  @ApiProperty({ required: false })
  @Column({ name: "product_snapshot", type: "jsonb", nullable: true })
  productSnapshot?: ReservationItemSnapshot[]

  @ApiProperty({ required: false })
  @Column({ name: "event_snapshot", type: "jsonb", nullable: true })
  eventSnapshot?: ReservationItemSnapshot[]

  // 닥터팔레트 plan id 저장
  @ApiProperty()
  @Column({ nullable: true })
  palettePlanId?: string

  // 예약이 생성된 닥터팔레트 스케줄 ID (예약 수정 시 원본 스케줄 유지용)
  @ApiProperty()
  @Column({ nullable: true })
  paletteScheduleId?: string
}
