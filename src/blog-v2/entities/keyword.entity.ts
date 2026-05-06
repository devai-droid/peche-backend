import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"

@Entity({ schema: "blog", name: "keywords" })
export class BlogKeyword extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Index("idx_blog_keywords_keyword")
  @Column({ length: 100 })
  keyword: string

  @ApiProperty({ required: false })
  @Column({ name: "thumbnail_url", length: 500, nullable: true })
  thumbnailUrl?: string

  @ApiProperty({ required: false })
  @Column({ type: "text", nullable: true })
  description?: string

  @ApiProperty({ required: false, description: "FK public.product_category(id) — application-level" })
  @Index("idx_blog_keywords_product_category")
  @Column({ name: "product_category_id", type: "uuid", nullable: true })
  productCategoryId?: string

  @ApiProperty()
  @Column({ name: "target_site", length: 50, default: "peche" })
  targetSite: string
}
