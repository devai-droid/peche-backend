import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { BlogCategory } from "@root/blog/entities/blog-category.entity"

@Entity()
export class BlogPost extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ unique: true })
  slug: string

  @ApiProperty()
  @Column()
  title: string

  @ApiProperty()
  @Column({ nullable: true })
  titleEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  titleZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  titleZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  titleJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  titleTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  summary?: string

  @ApiProperty()
  @Column({ nullable: true })
  summaryEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  summaryZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  summaryZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  summaryJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  summaryTH?: string

  @ApiProperty()
  @Column({ type: "text" })
  content: string

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  contentEN?: string

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  contentZH?: string

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  contentZHTW?: string

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  contentJA?: string

  @ApiProperty()
  @Column({ type: "text", nullable: true })
  contentTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  thumbnailUrl?: string

  @ApiProperty()
  @Column()
  author: string

  @ApiProperty()
  @Column({ default: true })
  visible: boolean

  @ApiProperty()
  @Column({ default: 0 })
  viewCount: number

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  publishedAt?: Date

  @ApiProperty()
  @Column({ nullable: true })
  keywords?: string

  @ApiProperty({ type: () => BlogCategory, isArray: true })
  @ManyToMany(() => BlogCategory, { eager: true })
  @JoinTable()
  categories: BlogCategory[]

  @ApiProperty()
  @Column({ nullable: true })
  eventCategoryId?: string
}
