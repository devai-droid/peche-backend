import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { ProductService } from "@root/product/service/product.service"
import { EventService } from "@root/event/service/event.service"
import { SearchQueryDto } from "@root/system/dto/search-query.dto"

@Injectable()
export class SearchService {
  constructor(
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
    @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
  ) {}

  async search(query: SearchQueryDto) {
    const products = await this.productService.findManyByQuery(query.query)
    const events = await this.eventService.findManyByQuery(query.query)
    return { products, events }
  }
}
