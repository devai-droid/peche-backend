import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { ProductDetailPageStatus } from "@root/shared/enum/product"
import { ProductCategory } from "@root/product/entities/product-category.entity"
import { RelatedProductDetailPage } from "@root/product/entities/related-product-detail-page.entity"
import { Product } from "@root/product/entities/product.entity"

@Entity()
export class ProductDetailPage extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @ManyToOne(() => ProductCategory, { nullable: true, eager: true })
  @JoinColumn()
  category?: ProductCategory | null

  @Column({ type: "uuid", nullable: true })
  categoryId?: string | null

  @ApiProperty()
  @Column({ type: "enum", enum: ProductDetailPageStatus, nullable: false, default: ProductDetailPageStatus.ACTIVE })
  status?: ProductDetailPageStatus

  @ApiProperty()
  @Column({ nullable: true })
  name?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  description?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  referenceUrl: string

  @ApiProperty()
  @Column({ nullable: true })
  procedure: string

  @ApiProperty()
  @Column({ nullable: true })
  procedureEN: string

  @ApiProperty()
  @Column({ nullable: true })
  procedureZH: string

  @ApiProperty()
  @Column({ nullable: true })
  procedureZHTW: string

  @ApiProperty()
  @Column({ nullable: true })
  procedureJA: string

  @ApiProperty()
  @Column({ nullable: true })
  procedureTH: string

  @ApiProperty()
  @Column({ nullable: true })
  information: string

  @ApiProperty()
  @Column({ nullable: true })
  informationEN: string

  @ApiProperty()
  @Column({ nullable: true })
  informationZH: string

  @ApiProperty()
  @Column({ nullable: true })
  informationZHTW: string

  @ApiProperty()
  @Column({ nullable: true })
  informationJA: string

  @ApiProperty()
  @Column({ nullable: true })
  informationTH: string

  @ApiProperty()
  @Column({ nullable: true })
  advantages: string

  @ApiProperty()
  @Column({ nullable: true })
  advantagesEN: string

  @ApiProperty()
  @Column({ nullable: true })
  advantagesZH: string

  @ApiProperty()
  @Column({ nullable: true })
  advantagesZHTW: string

  @ApiProperty()
  @Column({ nullable: true })
  advantagesJA: string

  @ApiProperty()
  @Column({ nullable: true })
  advantagesTH: string

  @ApiProperty()
  @Column({ nullable: true })
  target: string

  @ApiProperty()
  @Column({ nullable: true })
  targetEN: string

  @ApiProperty()
  @Column({ nullable: true })
  targetZH: string

  @ApiProperty()
  @Column({ nullable: true })
  targetZHTW: string

  @ApiProperty()
  @Column({ nullable: true })
  targetJA: string

  @ApiProperty()
  @Column({ nullable: true })
  targetTH: string

  @ApiProperty()
  @Column({ nullable: true })
  qAndA: string

  @ApiProperty()
  @Column({ nullable: true })
  qAndAEN: string

  @ApiProperty()
  @Column({ nullable: true })
  qAndAZH: string

  @ApiProperty()
  @Column({ nullable: true })
  qAndAZHTW: string

  @ApiProperty()
  @Column({ nullable: true })
  qAndAJA: string

  @ApiProperty()
  @Column({ nullable: true })
  qAndATH: string

  @ApiProperty()
  @Column({ nullable: true })
  caution: string

  @ApiProperty()
  @Column({ nullable: true })
  cautionEN: string

  @ApiProperty()
  @Column({ nullable: true })
  cautionZH: string

  @ApiProperty()
  @Column({ nullable: true })
  cautionZHTW: string

  @ApiProperty()
  @Column({ nullable: true })
  cautionJA: string

  @ApiProperty()
  @Column({ nullable: true })
  cautionTH: string

  @ApiProperty()
  @OneToMany(() => RelatedProductDetailPage, (relatedDetailPage) => relatedDetailPage.productDetailPage)
  relatedDetailPages?: RelatedProductDetailPage[]

  @ApiProperty()
  @Column({ nullable: true })
  order?: number

  @ApiProperty()
  @OneToMany(() => Product, (product) => product.detailPage)
  products?: Product[]
}
