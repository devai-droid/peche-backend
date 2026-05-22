import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"

@Entity({ schema: "blog", name: "doctors" })
export class BlogDoctor extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ length: 100 })
  name: string

  @ApiProperty({ required: false })
  @Column({ length: 200, nullable: true })
  specialty?: string

  @ApiProperty({ required: false })
  @Column({ name: "job_title", length: 200, nullable: true })
  jobTitle?: string

  @ApiProperty({ required: false, description: "의료진 소개글 — 모든 블로그 글 하단 의료진 카드에 공통 노출" })
  @Column({ type: "text", nullable: true })
  bio?: string

  @ApiProperty({ required: false, type: [String] })
  @Column("text", { array: true, nullable: true })
  associations?: string[]

  @ApiProperty({ required: false })
  @Column({ name: "license_number", length: 50, nullable: true })
  licenseNumber?: string

  @ApiProperty({ required: false })
  @Column({ name: "profile_url", length: 500, nullable: true })
  profileUrl?: string

  @ApiProperty({ required: false })
  @Column({ name: "photo_url", length: 500, nullable: true })
  photoUrl?: string

  @ApiProperty()
  @Index("idx_blog_doctors_visible", { where: '"is_visible" = true' })
  @Column({ name: "is_visible", default: true })
  isVisible: boolean

  @ApiProperty()
  @Column({ name: "target_site", length: 50, default: "peche" })
  targetSite: string
}
