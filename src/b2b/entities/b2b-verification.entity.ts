import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm"

/**
 * 회사 이메일 인증 1건 = 예약 1건 권한. 인증 후 B2B_VERIFICATION_TTL 안에 예약 1건에만 사용할 수 있다.
 * usedAt 이 채워지면 재사용 불가(예약할 때마다 재인증).
 */
@Entity({ schema: "b2b", name: "verifications" })
export class B2bVerification {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @CreateDateColumn({ name: "created_at", type: "timestamptz", update: false })
  createdAt: Date

  @Index("idx_b2b_verifications_company")
  @Column({ name: "company_id", type: "uuid" })
  companyId: string

  // public.account_user.id (FK 없음, 애플리케이션 조인)
  @Column({ name: "user_id", type: "uuid" })
  userId: string

  @Column({ length: 200 })
  email: string

  @Column({ length: 100 })
  name: string

  @Column({ length: 30 })
  phone: string

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date

  @Column({ name: "used_at", type: "timestamptz", nullable: true })
  usedAt?: Date | null
}
