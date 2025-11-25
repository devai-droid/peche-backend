import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { MostPopularItem } from "./most-popular-item.entity"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

@Entity()
export class MostPopularCategory extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ enum: ["ACTIVE", "INACTIVE"] })
  @Column({ default: "ACTIVE" })
  status: "ACTIVE" | "INACTIVE"

  // ----------------------------
  // 언어별 카테고리명
  // ----------------------------
  @ApiPropertyOptional()
  @Column({ nullable: true })
  name?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  nameEN?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  nameZH?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  nameZHTW?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  nameJA?: string

  @ApiPropertyOptional()
  @Column({ nullable: true })
  nameTH?: string

  // ----------------------------
  // 언어별 키워드 배열
  // ----------------------------
  @ApiPropertyOptional({ type: [String] })
  @Column("text", { array: true, nullable: true })
  keywords?: string[]

  @ApiPropertyOptional({ type: [String] })
  @Column("text", { array: true, nullable: true })
  keywordsEN?: string[]

  @ApiPropertyOptional({ type: [String] })
  @Column("text", { array: true, nullable: true })
  keywordsZH?: string[]

  @ApiPropertyOptional({ type: [String] })
  @Column("text", { array: true, nullable: true })
  keywordsZHTW?: string[]

  @ApiPropertyOptional({ type: [String] })
  @Column("text", { array: true, nullable: true })
  keywordsJA?: string[]

  @ApiPropertyOptional({ type: [String] })
  @Column("text", { array: true, nullable: true })
  keywordsTH?: string[]

  @ApiPropertyOptional()
  @Column({ nullable: true })
  order?: number

  // ----------------------------
  // 하위 MostPopularItem 목록
  // ----------------------------
  @ApiPropertyOptional({ type: () => [MostPopularItem] })
  @OneToMany(() => MostPopularItem, (item) => item.category, { cascade: true })
  items: MostPopularItem[]
}
