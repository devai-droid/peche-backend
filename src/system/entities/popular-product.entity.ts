import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { PopularProductStatus } from "@root/shared/enum/system"
import { Product } from "@root/product/entities/product.entity"

@Entity()
export class PopularProduct extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: PopularProductStatus, nullable: false, default: PopularProductStatus.INACTIVE })
  status: PopularProductStatus

  @ApiProperty()
  @Column({ nullable: true })
  description?: string

  @ApiProperty()
  @Column({ nullable: true })
  productName?: string

  @ApiProperty()
  @Column({ nullable: true })
  productNameEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  productNameZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  productNameZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  productNameJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  productNameTH?: string

  @ApiProperty()
  @ManyToOne(() => Product, {
    nullable: true,
    eager: true,
    onDelete: "SET NULL",
  })
  @JoinColumn()
  product?: Product

  @ApiProperty()
  @Column({ nullable: true })
  order?: number
}
