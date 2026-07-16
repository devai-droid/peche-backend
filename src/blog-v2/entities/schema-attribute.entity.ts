import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"

/** 속성 마스터 대상: 상품 대분류 / 상세페이지(=시술) / 병원(진료과 양식) */
export enum BlogSchemaTarget {
  CATEGORY = "category",
  DETAIL_PAGE = "detail_page",
  CLINIC = "clinic",
}

/**
 * 스키마 속성 마스터 — 시술(상세페이지)·대분류마다 붙일 schema.org 속성을 한 번만 등록.
 * 글 렌더 시 product_page → 상세페이지 + 소속 대분류를 찾아 여기 속성을 about 노드에 자동 첨부.
 * 속성은 자유 키-값이라 코드가 키를 고정하지 않는다(추가 속성이 생겨도 코드 수정 불필요).
 */
@Entity({ schema: "blog", name: "schema_attributes" })
@Index("uq_blog_schema_attributes_target_name", ["targetType", "name"], { unique: true })
export class BlogSchemaAttribute extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ enum: BlogSchemaTarget, description: "category(상품 대분류) / detail_page(상세페이지=시술)" })
  @Column({ name: "target_type", length: 20 })
  targetType: BlogSchemaTarget

  @ApiProperty({ description: "대상 이름 — product_category.name 또는 product_detail_page.name과 정확히 일치" })
  @Column({ length: 200 })
  name: string

  @ApiProperty({
    required: false,
    description: '자유 키-값 schema.org 속성. 예: {"@type":"MedicalCondition","signOrSymptom":"면포, 농포"}',
  })
  @Column({ type: "jsonb", nullable: true })
  attributes?: Record<string, unknown>
}
