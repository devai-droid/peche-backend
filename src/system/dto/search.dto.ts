import { ApiProperty } from "@nestjs/swagger"
import { Event } from "@root/event/entities/event.entity"
import { Product } from "@root/product/entities/product.entity"

export class SearchResultList {
  @ApiProperty({ type: Product, isArray: true }) products: Product[]
  @ApiProperty({ type: Event, isArray: true }) events: Event[]
}
