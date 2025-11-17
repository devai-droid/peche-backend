import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { FileService } from "@root/file/service/files.service"
import { paginate } from "@root/shared/pagination"
import { MainImageStatus } from "@root/shared/enum/system"
import { User } from "@root/shared/interface/user"
import { CreateMainImageDto, UpdateMainImageDto } from "@root/system/dto/main-image.dto"
import { MainImage } from "@root/system/entities/main-image.entity"
import { MainImageQueryDto } from "@root/system/dto/main-image-query.dto"

@Injectable()
export class MainImageService {
  constructor(
    @InjectRepository(MainImage) private repository: Repository<MainImage>,
    @Inject(forwardRef(() => FileService)) private readonly fileService: FileService,
  ) {}

  async create(dto: CreateMainImageDto) {
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(image && { image: image }),
      }),
    )
  }

  async findManyWithPaginationQuery(query?: MainImageQueryDto) {
    const findOptions = <FindManyOptions<MainImage>>{
      where: {
        ...(query?.status && { status: query.status }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<MainImage>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAllActive() {
    return this.repository.find({ where: { status: MainImageStatus.ACTIVE } })
  }

  async update(id: string, dto: UpdateMainImageDto, user?: User) {
    const mainImage = await this.findOne(id)
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    return this.repository.save(
      Object.assign(mainImage, dto, {
        updatedBy: user?.id,
        ...(image && { image: image }),
      }),
    )
  }

  async remove(id: string) {
    const mainImage = await this.findOne(id)
    return this.repository.remove(mainImage)
  }
}
