import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { ProductBackupBundle } from "@root/product/entities/product-backup-bundle.entity"
import { ProductBackupService } from "@root/product/service/product-backup.service"
import { ProductService } from "@root/product/service/product.service"
import { paginate } from "@root/shared/pagination"
import { ProductBackupBundleQueryDto } from "@root/product/dto/product-backup-bundle-query.dto"

@Injectable()
export class ProductBackupBundleService {
  constructor(
    @InjectRepository(ProductBackupBundle) private repository: Repository<ProductBackupBundle>,
    @Inject(forwardRef(() => ProductBackupService))
    private readonly productBackupService: ProductBackupService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

  async create() {
    const lastBundle = await this.findLastOne()
    const lastNumber = lastBundle ? Number(lastBundle.name) : 0
    const bundle = await this.repository.save(
      Object.assign(new ProductBackupBundle(), {
        name: `${lastNumber + 1}`,
      }),
    )
    await this.productBackupService.backup(bundle)
    return bundle
  }

  async findManyWithPaginationQuery(query?: ProductBackupBundleQueryDto) {
    const findOptions = <FindManyOptions<ProductBackupBundle>>{
      where: {},
      order: query.orderByOptions(),
    }
    return await paginate<ProductBackupBundle>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findLastOne() {
    const result = await this.repository.find({
      skip: 0,
      take: 1,
      order: { name: "DESC" },
    })
    return result && result.length > 0 ? result[0] : undefined
  }

  async remove(id: string) {
    const bundle = await this.findOne(id)
    await this.productBackupService.removeByBundleId(bundle.id)
    return this.repository.remove(bundle)
  }

  async loadBundle(id: string) {
    const bundle = await this.findOne(id)
    const productBackup = await this.productBackupService.findAllByBackupBundleId(id)
    await this.productService.loadBackup(productBackup)
    return bundle
  }
}
