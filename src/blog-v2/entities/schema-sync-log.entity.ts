import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"

/**
 * 스키마 속성 양식 업로드(동기화) 이력.
 * sync-md를 한 번 실행할 때마다 한 줄 기록 — 언제, 누가, 몇 건을 등록·갱신·삭제했는지.
 * 어드민 「스키마 속성 관리」의 수정 이력 표에 노출.
 */
@Entity({ schema: "blog", name: "schema_sync_logs" })
export class BlogSchemaSyncLog extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ description: "업로드한 담당자(이메일 또는 id)" })
  @Column({ name: "synced_by", nullable: true })
  syncedBy?: string

  @ApiProperty({ description: "신규 등록 건수" })
  @Column({ type: "int", default: 0 })
  added: number

  @ApiProperty({ description: "갱신 건수" })
  @Column({ type: "int", default: 0 })
  updated: number

  @ApiProperty({ description: "삭제 건수" })
  @Column({ type: "int", default: 0 })
  deleted: number

  @ApiProperty({ description: "적용 후 총 항목 수" })
  @Column({ type: "int", default: 0 })
  total: number

  @ApiProperty({ description: "사이트에서 이름을 찾지 못한 항목 수" })
  @Column({ name: "unmatched_count", type: "int", default: 0 })
  unmatchedCount: number
}
