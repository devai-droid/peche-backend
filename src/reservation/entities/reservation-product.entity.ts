import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { CreatedOnlyTimeStampEntity } from "@root/shared/entity/created-only-time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { Exclude } from "class-transformer"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import { Product } from "@root/product/entities/product.entity"

@Entity()
export class ReservationProduct extends CreatedOnlyTimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Exclude()
  @ManyToOne(() => Reservation, (reservation) => reservation.id, { nullable: false })
  @JoinColumn()
  reservation: Reservation

  @ApiProperty({ type: () => Product })
  @ManyToOne(() => Product, (product) => product.id, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  product: Product
}
