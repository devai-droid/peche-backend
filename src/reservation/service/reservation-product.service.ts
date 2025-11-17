import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import { ReservationProduct } from "../entities/reservation-product.entity"
import { ProductService } from "@root/product/service/product.service"

@Injectable()
export class ReservationProductService {
  constructor(
    @InjectRepository(ReservationProduct) private repository: Repository<ReservationProduct>,
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
  ) {}

  async bulkCreate(reservation: Reservation, productIds: string[]) {
    const products = await this.productService.findManyByIds(productIds)
    return await this.repository.save(
      products.map((product) =>
        Object.assign(new ReservationProduct(), { reservation: reservation, product: product }),
      ),
    )
  }

  async findOneByReservationIdAndProductId(reservationId: string, productId: string) {
    return await this.repository.findOneOrFail({
      relations: ["reservation", "product"],
      where: { reservation: { id: reservationId }, product: { id: productId } },
    })
  }

  async findManyByReservationId(reservationId: string) {
    return await this.repository.find({ where: { reservation: { id: reservationId } } })
  }

  async removeByReservationId(reservationId: string) {
    const reservationProducts = await this.findManyByReservationId(reservationId)
    return await this.repository.remove(reservationProducts)
  }

  async removeByReservationIdAndProductId(reservationId: string, productId: string) {
    const reservationProduct = await this.findOneByReservationIdAndProductId(reservationId, productId)
    return await this.repository.remove(reservationProduct)
  }
}
