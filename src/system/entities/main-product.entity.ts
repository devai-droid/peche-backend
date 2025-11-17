import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { MainProductStatus } from "@root/shared/enum/system"
import { FileObject } from "@root/file/entities/file-object.entity"
import { Product } from "@root/product/entities/product.entity"

@Entity()
export class MainProduct extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: MainProductStatus, nullable: false, default: MainProductStatus.INACTIVE })
  status: MainProductStatus

  @ApiProperty()
  @Column({ nullable: true })
  description?: string

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  image?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageEN?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageZH?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageZHTW?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageJA?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageTH?: FileObject

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
