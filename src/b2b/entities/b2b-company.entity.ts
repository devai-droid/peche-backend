import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"

/** 협약 기업. 회사 이메일 도메인으로 직원 여부를 판단한다. 할인율은 닥팔 메모 전달용(가격 계산에 쓰지 않음). */
@Entity({ schema: "b2b", name: "companies" })
export class B2bCompany extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ length: 100 })
  name: string

  @ApiProperty({ type: [String], description: "회사 이메일 도메인(소문자, @ 제외). 예: samsung.com" })
  @Column({ name: "email_domains", type: "text", array: true, default: () => "'{}'" })
  emailDomains: string[]

  @ApiProperty({ required: false, description: "협약 할인율(%). 닥팔 메모 표기용" })
  @Column({
    name: "discount_rate",
    type: "numeric",
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v?: number | null) => v,
      from: (v?: string | null) => (v == null ? null : Number(v)),
    },
  })
  discountRate?: number | null

  @ApiProperty({ required: false, description: "할인 조건 메모(예: 제모 제외). 닥팔 메모에 함께 표기" })
  @Column({ name: "discount_note", length: 200, nullable: true })
  discountNote?: string | null

  @ApiProperty({ required: false, description: "계약 시작일(YYYY-MM-DD, KST)" })
  @Column({ name: "contract_start", type: "date", nullable: true })
  contractStart?: string | null

  @ApiProperty({ required: false, description: "계약 종료일(YYYY-MM-DD, KST, 당일 포함)" })
  @Column({ name: "contract_end", type: "date", nullable: true })
  contractEnd?: string | null

  @ApiProperty()
  @Column({ name: "is_active", default: true })
  isActive: boolean

  @ApiProperty({ required: false, description: "내부 메모(담당자 연락처 등)" })
  @Column({ type: "text", nullable: true })
  memo?: string | null
}
