import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"

/** 공통 고지문구 유형. */
export enum BlogCommonTextType {
  GENERAL_DISCLAIMER = "general_disclaimer", // 일반 면책 — 모든 글 하단
  AI_IMAGE_NOTICE = "ai_image_notice", // AI 이미지 고지
  PATIENT_CASE_NOTICE = "patient_case_notice", // 환자 사례·전후 사진 의료법
  REVIEW_NOTICE = "review_notice", // 후기·체험기 의료법
}

/**
 * 블로그 글 하단에 공통으로 들어가는 고지문구. 어드민에서 1곳만 고치면 전 글 일괄 반영.
 * 일반 면책은 모든 글, 나머지는 글별 선택(posts.notices)에 따라 조건부 노출.
 */
@Entity({ schema: "blog", name: "common_texts" })
@Unique("uq_blog_common_texts_site_type", ["targetSite", "type"])
export class BlogCommonText extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ name: "target_site", length: 50, default: "peche" })
  targetSite: string

  @ApiProperty({ enum: BlogCommonTextType })
  @Column({ length: 50 })
  type: BlogCommonTextType

  @ApiProperty({ required: false })
  @Column({ type: "text", nullable: true })
  body?: string

  @ApiProperty()
  @Column({ name: "is_active", default: true })
  isActive: boolean
}
