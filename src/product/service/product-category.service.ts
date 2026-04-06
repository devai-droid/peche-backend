import { ProductCategory } from "@root/product/entities/product-category.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { Injectable } from "@nestjs/common"
import { CreateProductCategoryDto, UpdateProductCategoryDto } from "@root/product/dto/product-category.dto"
import { CreateCategoryFromSheetDto } from "@root/product/dto/product.dto"
import { ProductCategoryQueryDto } from "@root/product/dto/product-category-query.dto"
import { paginate } from "@root/shared/pagination"
import { ProductCategoryStatus } from "@root/shared/enum/product"
import { User } from "@root/shared/interface/user"

@Injectable()
export class ProductCategoryService {
  constructor(@InjectRepository(ProductCategory) private repository: Repository<ProductCategory>) {}

  async create(dto: CreateProductCategoryDto) {
    return await this.repository.save(dto)
  }

  async findManyWithPaginationQuery(query?: ProductCategoryQueryDto) {
    const findOptions = <FindManyOptions<ProductCategory>>{
      relations: ["detailPages"],
      where: {
        ...(query?.status && { status: query.status }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<ProductCategory>(this.repository, query.paginationOptions(), findOptions)
  }

  async findAllActive() {
    return this.repository.find({ where: { status: ProductCategoryStatus.ACTIVE }, order: { order: "ASC" } })
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ relations: ["detailPages"], where: { id: id } })
  }

  async findOneByNameOrNull(name: string) {
    return this.repository.findOne({ relations: ["detailPages"], where: { name: name } })
  }

  async findOrCreateByName(dto: CreateCategoryFromSheetDto) {
    const existing = await this.findOneByNameOrNull(dto.name)
    if (existing) return existing
    return await this.repository.save(Object.assign(new ProductCategory(), dto))
  }

  async update(id: string, dto: UpdateProductCategoryDto, user?: User) {
    const productCategory = await this.findOne(id)
    return this.repository.save(Object.assign(productCategory, dto, { updatedBy: user?.id }))
  }

  async remove(id: string) {
    const productCategory = await this.findOne(id)
    return this.repository.remove(productCategory)
  }
}
