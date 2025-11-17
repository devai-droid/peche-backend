import { CreatedOnlyTimeStampEntity } from "@root/shared/entity/created-only-time-stamp.entity"
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Exclude } from "class-transformer"
import { ProductDetailPage } from "@root/product/entities/product-detail-page.entity"

@Entity()
export class RelatedProductDetailPage extends CreatedOnlyTimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Exclude()
  @ManyToOne(() => ProductDetailPage, (productDetailPage) => productDetailPage.id, { nullable: false })
  @JoinColumn()
  productDetailPage: ProductDetailPage

  @ApiProperty({ type: () => ProductDetailPage })
  @ManyToOne(() => ProductDetailPage, (productDetailPage) => productDetailPage.id, { nullable: false })
  @JoinColumn()
  relatedProductDetailPage: ProductDetailPage
}
