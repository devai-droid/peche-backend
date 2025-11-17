import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { FileService } from "@root/file/service/files.service"
import { paginate } from "@root/shared/pagination"
import { MainProductStatus } from "@root/shared/enum/system"
import { User } from "@root/shared/interface/user"
import { ProductService } from "@root/product/service/product.service"
import { CreateMainProductDto, UpdateMainProductDto } from "@root/system/dto/main-product.dto"
import { MainProduct } from "@root/system/entities/main-product.entity"
import { MainProductQueryDto } from "@root/system/dto/main-product-query.dto"

@Injectable()
export class MainProductService {
  constructor(
    @InjectRepository(MainProduct) private repository: Repository<MainProduct>,
    @Inject(forwardRef(() => FileService)) private readonly fileService: FileService,
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
  ) {}

  async create(dto: CreateMainProductDto) {
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    const imageEN = dto.imageENId ? await this.fileService.findOne(dto.imageENId) : undefined
    const imageZH = dto.imageZHId ? await this.fileService.findOne(dto.imageZHId) : undefined
    const imageZHTW = dto.imageZHTWId ? await this.fileService.findOne(dto.imageZHTWId) : undefined
    const imageJA = dto.imageJAId ? await this.fileService.findOne(dto.imageJAId) : undefined
    const imageTH = dto.imageTHId ? await this.fileService.findOne(dto.imageTHId) : undefined
    const product = dto.productId ? await this.productService.findOne(dto.productId) : null
    return await this.repository.save(
      Object.assign(dto, {
        ...(image && { image: image }),
        ...(imageEN && { imageEN: imageEN }),
        ...(imageZH && { imageZH: imageZH }),
        ...(imageZHTW && { imageZHTW: imageZHTW }),
        ...(imageJA && { imageJA: imageJA }),
        ...(imageTH && { imageTH: imageTH }),
        ...(product !== undefined && { product }),
      }),
    )
  }

  async findManyWithPaginationQuery(query?: MainProductQueryDto) {
    const findOptions = <FindManyOptions<MainProduct>>{
      where: {
        ...(query?.status && { status: query.status }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<MainProduct>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAllActive() {
    return this.repository.find({ where: { status: MainProductStatus.ACTIVE } })
  }

  async update(id: string, dto: UpdateMainProductDto, user?: User) {
    const mainProduct = await this.findOne(id)
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    const imageEN = dto.imageENId ? await this.fileService.findOne(dto.imageENId) : undefined
    const imageZH = dto.imageZHId ? await this.fileService.findOne(dto.imageZHId) : undefined
    const imageZHTW = dto.imageZHTWId ? await this.fileService.findOne(dto.imageZHTWId) : undefined
    const imageJA = dto.imageJAId ? await this.fileService.findOne(dto.imageJAId) : undefined
    const imageTH = dto.imageTHId ? await this.fileService.findOne(dto.imageTHId) : undefined
    const product = dto.productId
      ? await this.productService.findOne(dto.productId)
      : dto.productId === null
      ? null
      : undefined
    return this.repository.save(
      Object.assign(mainProduct, dto, {
        updatedBy: user?.id,
        ...(image && { image: image }),
        ...(imageEN && { imageEN: imageEN }),
        ...(imageZH && { imageZH: imageZH }),
        ...(imageZHTW && { imageZHTW: imageZHTW }),
        ...(imageJA && { imageJA: imageJA }),
        ...(imageTH && { imageTH: imageTH }),
        ...(product !== undefined && { product }),
      }),
    )
  }

  async remove(id: string) {
    const mainProduct = await this.findOne(id)
    return this.repository.remove(mainProduct)
  }
}
