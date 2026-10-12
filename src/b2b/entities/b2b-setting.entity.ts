import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm"

/** B2B 사이트 설정값(키-값). 예) reservation_notice: 예약 화면 안내 문구 */
@Entity({ schema: "b2b", name: "settings" })
export class B2bSetting {
  @PrimaryColumn({ length: 100 })
  key: string

  @Column({ type: "text", nullable: true })
  value?: string | null

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date

  @Column({ name: "updated_by", nullable: true })
  updatedBy?: string
}

export const B2B_SETTING_RESERVATION_NOTICE = "reservation_notice"
