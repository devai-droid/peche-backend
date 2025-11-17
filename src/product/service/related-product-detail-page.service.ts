import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { RelatedProductDetailPage } from "@root/product/entities/related-product-detail-page.entity"
import { ProductDetailPageService } from "@root/product/service/product-detail-page.service"

@Injectable()
export class RelatedProductDetailPageService {
  constructor(
    @InjectRepository(RelatedProductDetailPage) private repository: Repository<RelatedProductDetailPage>,
    @Inject(forwardRef(() => ProductDetailPageService))
    private readonly productDetailPageService: ProductDetailPageService,
  ) {}

  async create(productDetailPageId: string, relatedProductDetailPageId: string) {
    const productDetailPage = await this.productDetailPageService.findOne(productDetailPageId)
    const relatedDetailPage = await this.productDetailPageService.findOne(relatedProductDetailPageId)
    return await this.repository.save(
      Object.assign(new RelatedProductDetailPage(), {
        productDetailPage: productDetailPage,
        relatedProductDetailPage: relatedDetailPage,
      }),
    )
  }

  async bulkCreate(productDetailPageId: string, relatedProductDetailPageIds: string[]) {
    const productDetailPage = await this.productDetailPageService.findOne(productDetailPageId)
    const relatedDetailPages = await this.productDetailPageService.findByIds(relatedProductDetailPageIds)
    return await Promise.all(
      relatedDetailPages.map(async (page) => {
        return await this.repository.save(
          Object.assign(new RelatedProductDetailPage(), {
            productDetailPage: productDetailPage,
            relatedProductDetailPage: page,
          }),
        )
      }),
    )
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findOneByProductDetailPageIdAndRelatedProductDetailPageId(
    productDetailPageId: string,
    relatedProductDetailPageId: string,
  ) {
    return this.repository.findOneOrFail({
      where: {
        productDetailPage: { id: productDetailPageId },
        relatedProductDetailPage: { id: relatedProductDetailPageId },
      },
    })
  }

  async remove(id: string) {
    const relatedProductDetailPage = await this.findOne(id)
    return this.repository.remove(relatedProductDetailPage)
  }

  async removeByProductDetailPageIdAndRelatedProductDetailPageId(
    productDetailPageId: string,
    relatedProductDetailPageId: string,
  ) {
    const relatedProductDetailPage = await this.findOneByProductDetailPageIdAndRelatedProductDetailPageId(
      productDetailPageId,
      relatedProductDetailPageId,
    )
    return this.repository.remove(relatedProductDetailPage)
  }

  async removeByProductDetailPageId(productDetailPageId: string) {
    const relatedProductDetailPages = await this.repository.findBy({ productDetailPage: { id: productDetailPageId } })
    return this.repository.remove(relatedProductDetailPages)
  }
}
