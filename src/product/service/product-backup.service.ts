import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { ProductBackup } from "@root/product/entities/product-backup.entity"
import { ProductBackupBundle } from "@root/product/entities/product-backup-bundle.entity"
import { ProductService } from "@root/product/service/product.service"
import { paginate } from "@root/shared/pagination"
import { ProductBackupQueryDto } from "@root/product/dto/product-backup-query.dto"
import { CreateProductBackupDto, UpdateProductBackupDto } from "@root/product/dto/product-backup.dto"
import { ProductCategoryService } from "@root/product/service/product-category.service"
import { ProductDetailPageService } from "@root/product/service/product-detail-page.service"
import { IntegratedCrmCategoryService } from "@root/smart-doctor/service/integrated-crm-category.service"
import { User } from "@root/shared/interface/user"
import { ProductBackupBundleService } from "@root/product/service/product-backup-bundle.service"

@Injectable()
export class ProductBackupService {
  constructor(
    @InjectRepository(ProductBackup) private repository: Repository<ProductBackup>,
    @Inject(forwardRef(() => ProductBackupBundleService))
    private readonly productBackupBundleService: ProductBackupBundleService,
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
    @Inject(forwardRef(() => ProductCategoryService)) private readonly productCategoryService: ProductCategoryService,
    @Inject(forwardRef(() => ProductDetailPageService))
    private readonly productDetailPageService: ProductDetailPageService,
    @Inject(forwardRef(() => IntegratedCrmCategoryService))
    private readonly integratedCrmCategoryService: IntegratedCrmCategoryService,
  ) {}

  async backup(bundle: ProductBackupBundle) {
    const products = await this.productService.findAll()
    await Promise.all(
      products.map(async (product) => {
        return await this.repository.save(
          Object.assign(new ProductBackup(), {
            backupBundle: bundle,
            originProductId: product.id,
            category: product.category,
            detailPage: product.detailPage,
            integratedCrmCategory: product.integratedCrmCategory,
            name: product.name,
            nameEN: product.nameEN,
            nameZH: product.nameZH,
            nameZHTW: product.nameZHTW,
            nameJA: product.nameJA,
            nameTH: product.nameTH,
            description: product.description,
            descriptionEN: product.descriptionEN,
            descriptionZH: product.descriptionZH,
            descriptionZHTW: product.descriptionZHTW,
            descriptionJA: product.descriptionJA,
            descriptionTH: product.descriptionTH,
            price: product.price,
            order: product.order,
            orderEN: product.orderEN,
            orderZH: product.orderZH,
            orderZHTW: product.orderZHTW,
            orderJA: product.orderJA,
            orderTH: product.orderTH,
            visible: product.visible,
            visibleEN: product.visibleEN,
            visibleZH: product.visibleZH,
            visibleZHTW: product.visibleZHTW,
            visibleJA: product.visibleJA,
            visibleTH: product.visibleTH,
          }),
        )
      }),
    )
  }

  async create(dto: CreateProductBackupDto) {
    const backupBundle = await this.productBackupBundleService.findOne(dto.backupBundleId)
    const category = dto.categoryId ? await this.productCategoryService.findOne(dto.categoryId) : undefined
    const detailPage = dto.detailPageId ? await this.productDetailPageService.findOne(dto.detailPageId) : undefined
    const integratedCrmCategory = dto.integratedCrmCategoryId
      ? await this.integratedCrmCategoryService.findOne(dto.integratedCrmCategoryId)
      : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(backupBundle && { backupBundle: backupBundle }),
        ...(category && { category: category }),
        ...(detailPage && { detailPage: detailPage }),
        ...(integratedCrmCategory && { integratedCrmCategory: integratedCrmCategory }),
      }),
    )
  }

  async findAllByBackupBundleId(backupBundleId: string) {
    return this.repository.find({ where: { backupBundle: { id: backupBundleId } } })
  }

  async findManyWithPaginationQuery(query?: ProductBackupQueryDto) {
    const findOptions = <FindManyOptions<ProductBackup>>{
      where: {
        ...(query?.backupBundleId && { backupBundle: { id: query.backupBundleId } }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<ProductBackup>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async update(id: string, dto: UpdateProductBackupDto, user?: User) {
    const productBackup = await this.findOne(id)
    const category = dto.categoryId ? await this.productCategoryService.findOne(dto.categoryId) : undefined
    const detailPage = dto.detailPageId ? await this.productDetailPageService.findOne(dto.detailPageId) : undefined
    const integratedCrmCategory = dto.integratedCrmCategoryId
      ? await this.integratedCrmCategoryService.findOne(dto.integratedCrmCategoryId)
      : undefined
    return this.repository.save(
      Object.assign(productBackup, dto, {
        updatedBy: user?.id,
        ...(category && { category: category }),
        ...(detailPage && { detailPage: detailPage }),
        ...(integratedCrmCategory && { integratedCrmCategory: integratedCrmCategory }),
      }),
    )
  }

  async removeByBundleId(backupBundleId: string) {
    const backups = await this.findAllByBackupBundleId(backupBundleId)
    return this.repository.remove(backups)
  }

  async remove(id: string) {
    const productBackup = await this.findOne(id)
    return this.repository.remove(productBackup)
  }
}
