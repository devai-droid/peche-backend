import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, In, Repository } from "typeorm"
import { ProductCategoryService } from "@root/product/service/product-category.service"
import { paginate } from "@root/shared/pagination"
import { ProductDetailPageStatus } from "@root/shared/enum/product"
import { User } from "@root/shared/interface/user"
import { ProductDetailPage } from "@root/product/entities/product-detail-page.entity"
import { ProductCategory } from "@root/product/entities/product-category.entity"
import { CreateProductDetailPageDto, UpdateProductDetailPageDto } from "@root/product/dto/product-detail-page.dto"
import { CreateDetailPageFromSheetDto } from "@root/product/dto/product.dto"
import { ProductDetailPageQueryDto } from "@root/product/dto/product-detail-page-query.dto"
import { RelatedProductDetailPageService } from "@root/product/service/related-product-detail-page.service"
import { ProductService } from "@root/product/service/product.service"
import { FileService } from "@root/file/service/files.service"

@Injectable()
export class ProductDetailPageService {
  constructor(
    @InjectRepository(ProductDetailPage) private repository: Repository<ProductDetailPage>,
    @Inject(forwardRef(() => ProductCategoryService)) private readonly productCategoryService: ProductCategoryService,
    @Inject(forwardRef(() => RelatedProductDetailPageService))
    private readonly relatedProductDetailPageService: RelatedProductDetailPageService,
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
    @Inject(forwardRef(() => FileService)) private readonly fileService: FileService,
  ) {}

  async create(dto: CreateProductDetailPageDto) {
    const category = dto.categoryId ? await this.productCategoryService.findOne(dto.categoryId) : undefined

    // 이미지 처리
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    const imageEN = dto.imageENId ? await this.fileService.findOne(dto.imageENId) : undefined
    const imageZH = dto.imageZHId ? await this.fileService.findOne(dto.imageZHId) : undefined
    const imageZHTW = dto.imageZHTWId ? await this.fileService.findOne(dto.imageZHTWId) : undefined
    const imageJA = dto.imageJAId ? await this.fileService.findOne(dto.imageJAId) : undefined
    const imageTH = dto.imageTHId ? await this.fileService.findOne(dto.imageTHId) : undefined

    const productDetailPage = await this.repository.save(
      Object.assign(dto, {
        category,
        ...(image && { image }),
        ...(imageEN && { imageEN }),
        ...(imageZH && { imageZH }),
        ...(imageZHTW && { imageZHTW }),
        ...(imageJA && { imageJA }),
        ...(imageTH && { imageTH }),
      }),
    )

    if (dto.relatedDetailPageIds) {
      await this.relatedProductDetailPageService.bulkCreate(productDetailPage.id, dto.relatedDetailPageIds)
    }

    return productDetailPage
  }

  async findManyWithPaginationQuery(query?: ProductDetailPageQueryDto) {
    const findOptions = <FindManyOptions<ProductDetailPage>>{
      relations: ["products"],
      where: {
        ...(query?.status && { status: query.status }),
        ...(query?.categoryId && { category: { id: query.categoryId } }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<ProductDetailPage>(this.repository, query.paginationOptions(), findOptions)
  }

  async findAllActive() {
    return this.repository.find({ where: { status: ProductDetailPageStatus.ACTIVE }, order: { order: "ASC" } })
  }

  async findOne(id: string) {
    const productDetailPage = await this.repository.findOneOrFail({
      relations: ["relatedDetailPages", "relatedDetailPages.relatedProductDetailPage", "products"],
      where: { id: id },
    })
    const products = await this.productService.findManyByProductDetailPageId(id)
    return Object.assign(productDetailPage, { products: products })
  }

  async findOneByNameOrNull(name: string) {
    const entityName = "product_detail_page"
    const queryBuilder = this.repository.createQueryBuilder(entityName)
    queryBuilder.andWhere(`REPLACE(name, ' ', '') LIKE :name`, { name: name.replaceAll(" ", "") })
    return queryBuilder.getOne()
  }

  async findOrCreateByName(dto: CreateDetailPageFromSheetDto, category?: ProductCategory) {
    const existing = dto.name ? await this.findOneByNameOrNull(dto.name) : null
    if (existing) return existing
    const { categoryName, ...fields } = dto
    return await this.repository.save(
      Object.assign(new ProductDetailPage(), fields, category ? { category } : {}),
    )
  }

  async updateOrder(id: string, order: number) {
    return this.repository.update(id, { order })
  }

  async findByIds(ids: string[]) {
    return await this.repository.findBy({ id: In(ids) })
  }

  async update(id: string, dto: UpdateProductDetailPageDto, user?: User) {
    const productDetailPage = await this.findOne(id)

    const category = dto.categoryId ? await this.productCategoryService.findOne(dto.categoryId) : null

    // 이미지 처리
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    const imageEN = dto.imageENId ? await this.fileService.findOne(dto.imageENId) : undefined
    const imageZH = dto.imageZHId ? await this.fileService.findOne(dto.imageZHId) : undefined
    const imageZHTW = dto.imageZHTWId ? await this.fileService.findOne(dto.imageZHTWId) : undefined
    const imageJA = dto.imageJAId ? await this.fileService.findOne(dto.imageJAId) : undefined
    const imageTH = dto.imageTHId ? await this.fileService.findOne(dto.imageTHId) : undefined

    const relatedDetailPages = dto.relatedDetailPageIds ? await this.findByIds(dto.relatedDetailPageIds) : undefined

    if (relatedDetailPages) {
      await this.relatedProductDetailPageService.removeByProductDetailPageId(productDetailPage.id)
      await this.relatedProductDetailPageService.bulkCreate(productDetailPage.id, dto.relatedDetailPageIds)
    }

    return this.repository.save(
      Object.assign(productDetailPage, dto, {
        updatedBy: user?.id,
        category: category,
        ...(image && { image }),
        ...(imageEN && { imageEN }),
        ...(imageZH && { imageZH }),
        ...(imageZHTW && { imageZHTW }),
        ...(imageJA && { imageJA }),
        ...(imageTH && { imageTH }),
      }),
    )
  }

  async remove(id: string) {
    const productDetailPage = await this.findOne(id)
    return this.repository.remove(productDetailPage)
  }
}
