import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { FileService } from "@root/file/service/files.service"
import { paginate } from "@root/shared/pagination"
import { PopularProductStatus } from "@root/shared/enum/system"
import { User } from "@root/shared/interface/user"
import { ProductService } from "@root/product/service/product.service"
import { CreatePopularProductDto, UpdatePopularProductDto } from "@root/system/dto/popular-product.dto"
import { PopularProduct } from "@root/system/entities/popular-product.entity"
import { PopularProductQueryDto } from "@root/system/dto/popular-product-query.dto"

@Injectable()
export class PopularProductService {
  constructor(
    @InjectRepository(PopularProduct) private repository: Repository<PopularProduct>,
    @Inject(forwardRef(() => FileService)) private readonly fileService: FileService,
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
  ) {}

  async create(dto: CreatePopularProductDto) {
    const product = dto.productId ? await this.productService.findOne(dto.productId) : null

    return await this.repository.save(
      Object.assign(dto, {
        ...(product !== undefined && { product }),
      }),
    )
  }

  async findManyWithPaginationQuery(query?: PopularProductQueryDto) {
    const findOptions = <FindManyOptions<PopularProduct>>{
      where: {
        ...(query?.status && { status: query.status }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<PopularProduct>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id } })
  }

  async findAllActive() {
    return this.repository.find({ where: { status: PopularProductStatus.ACTIVE } })
  }

  async update(id: string, dto: UpdatePopularProductDto, user?: User) {
    const popularProduct = await this.findOne(id)
    const product = dto.productId
      ? await this.productService.findOne(dto.productId)
      : dto.productId === null
      ? null
      : undefined

    return this.repository.save(
      Object.assign(popularProduct, dto, {
        updatedBy: user?.id,
        ...(product !== undefined && { product }),
      }),
    )
  }

  async remove(id: string) {
    const popularProduct = await this.findOne(id)
    return this.repository.remove(popularProduct)
  }
}
