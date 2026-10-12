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

  // categoryId를 주면 "이름 + 카테고리"로 찾는다. 같은 이름 상세페이지를 대분류별로 따로 둘 수 있게 하기 위함
  // (예: "(마취 옵션) 에어녹스"를 탄력/리프팅·스킨부스터 양쪽에 각각). 안 주면 기존대로 이름만으로 찾는다.
  async findOneByNameOrNull(name: string, categoryId?: string) {
    const entityName = "product_detail_page"
    const queryBuilder = this.repository.createQueryBuilder(entityName)
    queryBuilder.andWhere(`REPLACE(name, ' ', '') LIKE :name`, { name: name.replaceAll(" ", "") })
    if (categoryId) queryBuilder.andWhere(`${entityName}.category_id = :cid`, { cid: categoryId })
    return queryBuilder.getOne()
  }

  async findOrCreateByName(dto: CreateDetailPageFromSheetDto, category?: ProductCategory) {
    // 이름 + 카테고리로 찾는다. 같은 이름이라도 대분류가 다르면 별도 상세페이지로 생성(공용 옵션을 여러 대분류에 노출).
    const existing = dto.name ? await this.findOneByNameOrNull(dto.name, category?.id) : null
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

    const saved = await this.repository.save(
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

    // 이 상세페이지(대표)의 "사본" 목록 반영 — 목록의 상세페이지들이 이걸 대표로 가리키게 하고,
    // 기존에 이걸 가리키던 것 중 목록에서 빠진 건 해제(원본으로 되돌림). 목록을 안 보내면 건드리지 않음.
    if (dto.copyDetailPageIds !== undefined) {
      const ids = dto.copyDetailPageIds.filter((v) => v && v !== id)
      const clear = this.repository
        .createQueryBuilder()
        .update(ProductDetailPage)
        .set({ canonicalDetailPageId: null })
        .where("canonical_detail_page_id = :id", { id })
      if (ids.length) clear.andWhere("id NOT IN (:...ids)", { ids })
      await clear.execute()
      if (ids.length) {
        await this.repository
          .createQueryBuilder()
          .update(ProductDetailPage)
          .set({ canonicalDetailPageId: id })
          .where("id IN (:...ids)", { ids })
          .execute()
      }
    }

    return saved
  }

  async remove(id: string) {
    const productDetailPage = await this.findOne(id)
    return this.repository.remove(productDetailPage)
  }
}
