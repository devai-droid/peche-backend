import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, ILike, In, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { Product } from "@root/product/entities/product.entity"
import {
  CreateProductDto,
  CreateProductFromGoogleSpreadsheetDto,
  ImportFromGoogleSpreadsheetProductDto,
  UpdateProductDto,
} from "@root/product/dto/product.dto"
import { ProductCategoryService } from "@root/product/service/product-category.service"
import { ProductDetailPageService } from "@root/product/service/product-detail-page.service"
import { IntegratedCrmCategoryService } from "@root/smart-doctor/service/integrated-crm-category.service"
import { ProductQueryDto } from "@root/product/dto/product-query.dto"
import { ProductBackup } from "@root/product/entities/product-backup.entity"
import { GoogleSpreadsheetHelper } from "@root/shared/helper/google-spreadsheet.helper"

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private repository: Repository<Product>,
    @Inject(forwardRef(() => ProductCategoryService)) private readonly productCategoryService: ProductCategoryService,
    @Inject(forwardRef(() => ProductDetailPageService))
    private readonly productDetailPageService: ProductDetailPageService,
    @Inject(forwardRef(() => IntegratedCrmCategoryService))
    private readonly integratedCrmCategoryService: IntegratedCrmCategoryService,
  ) {}

  async create(dto: CreateProductDto) {
    const category = dto.categoryId ? await this.productCategoryService.findOne(dto.categoryId) : undefined
    const detailPage = dto.detailPageId ? await this.productDetailPageService.findOne(dto.detailPageId) : undefined
    const integratedCrmCategory = dto.integratedCrmCategoryId
      ? await this.integratedCrmCategoryService.findOne(dto.integratedCrmCategoryId)
      : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(category && { category: category }),
        ...(detailPage && { detailPage: detailPage }),
        ...(integratedCrmCategory && { integratedCrmCategory: integratedCrmCategory }),
      }),
    )
  }

  async createFromGoogleSpreadsheet(dto: CreateProductFromGoogleSpreadsheetDto) {
    const detailPage = dto.detailPageName
      ? await this.productDetailPageService.findOneByNameOrNull(dto.detailPageName)
      : undefined
    const integratedCrmCategory = dto.integratedCrmCategoryName
      ? await this.integratedCrmCategoryService.findOneByNameOrNull(dto.integratedCrmCategoryName)
      : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(detailPage && { detailPage: detailPage }),
        ...(integratedCrmCategory && { integratedCrmCategory: integratedCrmCategory }),
      }),
    )
  }

  async findManyWithPaginationQuery(query?: ProductQueryDto) {
    const findOptions = <FindManyOptions<Product>>{
      where: {
        ...(query?.categoryId && { category: { id: query.categoryId } }),
        ...(query?.detailPageId && { detailPage: { id: query.detailPageId } }),
        ...(query?.integratedCrmCategoryId && { integratedCrmCategory: { id: query.integratedCrmCategoryId } }),
        ...(query?.visible && { visible: query.visible }),
        ...(query?.visibleEN && { visibleEN: query.visibleEN }),
        ...(query?.visibleZH && { visibleZH: query.visibleZH }),
        ...(query?.visibleZHTW && { visibleZHTW: query.visibleZHTW }),
        ...(query?.visibleJA && { visibleJA: query.visibleJA }),
        ...(query?.visibleTH && { visibleTH: query.visibleTH }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<Product>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAll() {
    return this.repository.find()
  }

  async findManyByProductDetailPageId(productDetailPageId: string) {
    return this.repository.find({ where: { detailPage: { id: productDetailPageId } } })
  }

  async findManyByIds(ids: string[]) {
    return this.repository.find({ where: { id: In(ids?.filter((id) => !!id) ?? []) } })
  }

  async findManyByQuery(query: string) {
    return this.repository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { nameEN: ILike(`%${query}%`) },
        { nameJA: ILike(`%${query}%`) },
        { nameZH: ILike(`%${query}%`) },
        { nameZHTW: ILike(`%${query}%`) },
        { nameTH: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
        { descriptionEN: ILike(`%${query}%`) },
        { descriptionJA: ILike(`%${query}%`) },
        { descriptionZH: ILike(`%${query}%`) },
        { descriptionZHTW: ILike(`%${query}%`) },
        { descriptionTH: ILike(`%${query}%`) },
      ],
    })
  }

  async update(id: string, dto: UpdateProductDto, user?: User) {
    const product = await this.findOne(id)
    const category = dto.categoryId ? await this.productCategoryService.findOne(dto.categoryId) : undefined
    const detailPage = dto.detailPageId ? await this.productDetailPageService.findOne(dto.detailPageId) : undefined
    const integratedCrmCategory = dto.integratedCrmCategoryId
      ? await this.integratedCrmCategoryService.findOne(dto.integratedCrmCategoryId)
      : undefined
    return this.repository.save(
      Object.assign(product, dto, {
        updatedBy: user?.id,
        ...(category && { category: category }),
        ...(detailPage && { detailPage: detailPage }),
        ...(integratedCrmCategory && { integratedCrmCategory: integratedCrmCategory }),
      }),
    )
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    return this.repository.remove(product)
  }

  async loadBackup(productBackup: ProductBackup[]) {
    const products = productBackup.map((backup) => {
      return Object.assign(new Product(), {
        ...backup,
        ...(backup.originProductId && { id: backup.originProductId }),
      })
    })
    return this.repository.save(products)
  }

  async importFromGoogleSpreadsheet(dto: ImportFromGoogleSpreadsheetProductDto) {
    const products = await GoogleSpreadsheetHelper.getProductsFromSpreadsheet(dto.url)
    if (products.length > 0) {
      return await Promise.all(
        products.map(async (dto) => {
          return await this.createFromGoogleSpreadsheet(dto)
        }),
      )
    }
    return []
  }
}
