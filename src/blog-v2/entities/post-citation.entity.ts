import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BlogPostV2 } from "@root/blog-v2/entities/post.entity"

@Entity({ schema: "blog", name: "post_citations" })
@Index("idx_blog_post_citations_post_order", ["postId", "orderNum"])
export class BlogPostCitation extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ name: "post_id", type: "uuid" })
  postId: string

  @ManyToOne(() => BlogPostV2, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post?: BlogPostV2

  @ApiProperty()
  @Column({ length: 500 })
  url: string

  @ApiProperty({ required: false })
  @Column({ length: 500, nullable: true })
  title?: string

  @ApiProperty({ required: false })
  @Column({ length: 200, nullable: true })
  publisher?: string

  @ApiProperty({ required: false })
  @Column({ type: "text", nullable: true })
  quote?: string

  @ApiProperty()
  @Column({ name: "order_num", type: "int", default: 0 })
  orderNum: number

  @ApiProperty()
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date
}
