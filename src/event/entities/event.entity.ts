import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { EventLabel } from "@root/shared/enum/event"
import { ProductDetailPage } from "@root/product/entities/product-detail-page.entity"
import { IntegratedCrmCategory } from "@root/smart-doctor/entities/integrated-crm-category.entity"
import { EventCategory } from "@root/event/entities/event-category.entity"
import { EventBundle } from "@root/event/entities/event-bundle.entity"

@Entity()
export class Event extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @ManyToOne(() => EventCategory, { nullable: true, eager: true })
  @JoinColumn()
  category?: EventCategory

  @ApiProperty()
  @ManyToOne(() => ProductDetailPage, { nullable: true, eager: true, onDelete: "CASCADE" })
  @JoinColumn()
  detailPage?: ProductDetailPage

  @ApiProperty()
  @ManyToOne(() => IntegratedCrmCategory, { nullable: true, eager: true })
  @JoinColumn()
  integratedCrmCategory?: IntegratedCrmCategory

  @ApiProperty()
  @ManyToOne(() => EventBundle, { nullable: true })
  @JoinColumn()
  bundle?: EventBundle

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
  discountPrice?: number

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

  @ApiProperty()
  @Column({ nullable: true })
  visible?: boolean

  @ApiProperty()
  @Column({ nullable: true })
  visibleEN?: boolean

  @ApiProperty()
  @Column({ nullable: true })
  visibleZH?: boolean

  @ApiProperty()
  @Column({ nullable: true })
  visibleZHTW?: boolean

  @ApiProperty()
  @Column({ nullable: true })
  visibleJA?: boolean

  @ApiProperty()
  @Column({ nullable: true })
  visibleTH?: boolean

  @ApiProperty()
  @Column({ type: "enum", enum: EventLabel, array: true, nullable: true })
  label?: EventLabel[]

  @ApiProperty()
  @Column({ type: "boolean", nullable: true, default: true })
  detailPageShow?: boolean
}
