import { BaseEntity, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { BlogPostV2 } from "@root/blog-v2/entities/post.entity"

@Entity({ schema: "blog", name: "post_slug_history" })
@Index("idx_blog_post_slug_history_old_slug", ["oldSlug", "lang"])
export class BlogPostSlugHistory extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Index("idx_blog_post_slug_history_post")
  @Column({ name: "post_id", type: "uuid" })
  postId: string

  @ManyToOne(() => BlogPostV2, { onDelete: "CASCADE" })
  @JoinColumn({ name: "post_id" })
  post?: BlogPostV2

  @ApiProperty()
  @Column({ name: "old_slug", length: 255 })
  oldSlug: string

  @ApiProperty()
  @Column({ length: 10 })
  lang: string

  @ApiProperty()
  @CreateDateColumn({ name: "changed_at", type: "timestamptz" })
  changedAt: Date
}
