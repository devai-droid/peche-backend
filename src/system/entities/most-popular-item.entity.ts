import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { FileObject } from "@root/file/entities/file-object.entity"
import { MostPopularCategory } from "./most-popular-category.entity"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

@Entity()
export class MostPopularItem extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  // 부모 카테고리
  @ApiPropertyOptional({ type: () => MostPopularCategory })
  @ManyToOne(() => MostPopularCategory, (category) => category.items, {
    onDelete: "CASCADE",
  })
  category: MostPopularCategory

  // 대표 이미지
  @ApiPropertyOptional({ type: () => FileObject })
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  image?: FileObject

  // ----------------------------
  // 언어별 제목
  // ----------------------------
  @ApiPropertyOptional()
  @Column({ nullable: true })
  title?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  titleEN?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  titleZH?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  titleZHTW?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  titleJA?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  titleTH?: string

  // ----------------------------
  // 상세 페이지 이동용 productDetailPageId
  // ----------------------------
  @ApiPropertyOptional()
  @Column({ nullable: true })
  productDetailPageId?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  order?: number
}
