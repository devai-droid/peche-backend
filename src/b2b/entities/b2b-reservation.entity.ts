import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"

/**
 * B2B 사이트에서 들어온 예약 1건의 회사·직원 정보. public.reservation 은 건드리지 않고 reservation_id 로만 연결한다.
 * 회사명·할인율은 예약 당시 값으로 고정(협약 조건이 바뀌어도 이력 보존).
 */
@Entity({ schema: "b2b", name: "reservations" })
export class B2bReservation {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @CreateDateColumn({ name: "created_at", type: "timestamptz", update: false })
  createdAt: Date

  // public.reservation.id (FK 없음)
  @ApiProperty()
  @Index("uq_b2b_reservations_reservation", { unique: true })
  @Column({ name: "reservation_id", type: "uuid" })
  reservationId: string

  @ApiProperty()
  @Index("idx_b2b_reservations_company")
  @Column({ name: "company_id", type: "uuid" })
  companyId: string

  @ApiProperty()
  @Column({ name: "verification_id", type: "uuid" })
  verificationId: string

  @ApiProperty()
  @Column({ name: "company_name", length: 100 })
  companyName: string

  @ApiProperty({ required: false })
  @Column({
    name: "discount_rate",
    type: "numeric",
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: { to: (v?: number | null) => v, from: (v?: string | null) => (v == null ? null : Number(v)) },
  })
  discountRate?: number | null

  @ApiProperty({ required: false })
  @Column({ name: "discount_note", length: 200, nullable: true })
  discountNote?: string | null

  @ApiProperty()
  @Index("idx_b2b_reservations_email")
  @Column({ length: 200 })
  email: string

  @ApiProperty()
  @Column({ length: 100 })
  name: string

  @ApiProperty()
  @Column({ length: 30 })
  phone: string
}
