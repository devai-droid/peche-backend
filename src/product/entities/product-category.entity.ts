import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { ProductCategoryStatus } from "@root/shared/enum/product"
import { ProductDetailPage } from "@root/product/entities/product-detail-page.entity"

@Entity()
export class ProductCategory extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: ProductCategoryStatus, nullable: false, default: ProductCategoryStatus.ACTIVE })
  status?: ProductCategoryStatus

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
  order?: number

  @ApiProperty()
  @OneToMany(() => ProductDetailPage, (productDetailPage) => productDetailPage.category)
  detailPages?: ProductDetailPage[]
}
