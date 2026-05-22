import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { BlogPostLang, BlogPostStatus } from "@root/blog-v2/enum/blog-v2.enum"
import { BlogKeyword } from "@root/blog-v2/entities/keyword.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"

@Entity({ schema: "blog", name: "posts" })
@Unique("uq_blog_posts_slug_lang", ["slug", "lang"])
export class BlogPostV2 extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ enum: BlogPostLang })
  @Index("idx_blog_posts_lang_status")
  @Column({ length: 10, default: BlogPostLang.KO })
  lang: BlogPostLang

  @ApiProperty({ enum: BlogPostStatus })
  @Index("idx_blog_posts_status")
  @Column({ length: 20, default: BlogPostStatus.DRAFT })
  status: BlogPostStatus

  @ApiProperty()
  @Column({ name: "target_site", length: 50, default: "peche" })
  targetSite: string

  @ApiProperty()
  @Column({ length: 500 })
  title: string

  @ApiProperty({ required: false })
  @Column({ length: 500, nullable: true })
  subtitle?: string

  @ApiProperty({ description: "마크다운 본문 (작성 원본)" })
  @Column({ name: "body_md", type: "text" })
  bodyMd: string

  @ApiProperty({ required: false, description: "마크다운 → HTML 변환 캐시" })
  @Column({ name: "body_html", type: "text", nullable: true })
  bodyHtml?: string

  @ApiProperty({ required: false })
  @Column({ name: "thumbnail_url", length: 500, nullable: true })
  thumbnailUrl?: string

  @ApiProperty()
  @Column({ length: 255 })
  slug: string

  @ApiProperty({ required: false, description: "100~150자 한글 요약 (.md frontmatter 또는 LLM fallback)" })
  @Column({ name: "summary_text", type: "text", nullable: true })
  summaryText?: string

  @ApiProperty({ required: false })
  @Index("idx_blog_posts_main_keyword")
  @Column({ name: "main_keyword", length: 100, nullable: true })
  mainKeyword?: string

  @ApiProperty({ required: false, type: [String] })
  @Column({ name: "sub_keywords", type: "text", array: true, nullable: true })
  subKeywords?: string[]

  @ApiProperty({ required: false })
  @Column({ name: "keyword_id", type: "uuid", nullable: true })
  keywordId?: string

  @ManyToOne(() => BlogKeyword, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "keyword_id" })
  keyword?: BlogKeyword

  @ApiProperty({ required: false, description: "FK public.product_category(id) — application-level" })
  @Index("idx_blog_posts_product_category")
  @Column({ name: "product_category_id", type: "uuid", nullable: true })
  productCategoryId?: string

  @ApiProperty({ required: false })
  @Index("idx_blog_posts_author_doctor")
  @Column({ name: "author_doctor_id", type: "uuid", nullable: true })
  authorDoctorId?: string

  @ManyToOne(() => BlogDoctor, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "author_doctor_id" })
  authorDoctor?: BlogDoctor

  @ApiProperty({ required: false })
  @Index("idx_blog_posts_published_at")
  @Column({ name: "published_at", type: "timestamptz", nullable: true })
  publishedAt?: Date

  @ApiProperty()
  @Column({ name: "view_count", type: "int", default: 0 })
  viewCount: number

  @ApiProperty({ required: false, description: "글 주인공 JSON-LD (마케터 medical_schema). 렌더 시 head 주입" })
  @Column({ name: "extra_jsonld", type: "jsonb", nullable: true })
  extraJsonld?: Record<string, unknown>

  @ApiProperty({ required: false, description: "MedicalProcedure/MedicalCondition/HowTo/Article" })
  @Column({ name: "schema_type", length: 50, nullable: true })
  schemaType?: string

  @ApiProperty({ required: false, description: "관련 글 섹션 [{anchor, slug}]" })
  @Column({ name: "internal_links", type: "jsonb", nullable: true })
  internalLinks?: Array<{ anchor: string; slug: string }>

  @ApiProperty({ required: false, description: "CTA 대상 상세페이지명 — 프론트가 이름으로 product_detail_page 매칭 (없으면 product_category로 fallback)" })
  @Column({ name: "product_page", length: 200, nullable: true })
  productPage?: string
}
