import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { ProductCategory } from "@root/product/entities/product-category.entity"
import { ProductDetailPage } from "@root/product/entities/product-detail-page.entity"
import { IntegratedCrmCategory } from "@root/smart-doctor/entities/integrated-crm-category.entity"

@Entity()
export class Product extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty({ type: () => ProductCategory })
  @ManyToOne(() => ProductCategory, { nullable: true, eager: true })
  @JoinColumn()
  category?: ProductCategory

  @ApiProperty({ type: () => ProductDetailPage })
  @ManyToOne(() => ProductDetailPage, { nullable: true, eager: true, onDelete: "CASCADE" })
  @JoinColumn()
  detailPage?: ProductDetailPage

  @ApiProperty()
  @ManyToOne(() => IntegratedCrmCategory, { nullable: true, eager: true })
  @JoinColumn()
  integratedCrmCategory?: IntegratedCrmCategory

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
  @Column({ nullable: false })
  price: number

  @ApiProperty()
  @Column({ nullable: true })
  order?: number

  @ApiProperty()
  @Column({ nullable: true })
  orderEN?: number

  @ApiProperty()
  @Column({ nullable: true })
  orderZH?: number

  @ApiProperty()
  @Column({ nullable: true })
  orderZHTW?: number

  @ApiProperty()
  @Column({ nullable: true })
  orderJA?: number

  @ApiProperty()
  @Column({ nullable: true })
  orderTH?: number

  @Column({ nullable: true })
  visible?: boolean

  @Column({ nullable: true })
  visibleEN?: boolean

  @Column({ nullable: true })
  visibleZH?: boolean

  @Column({ nullable: true })
  visibleZHTW?: boolean

  @Column({ nullable: true })
  visibleJA?: boolean

  @Column({ nullable: true })
  visibleTH?: boolean
}
