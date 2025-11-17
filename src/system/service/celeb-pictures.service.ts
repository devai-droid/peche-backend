import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { FileService } from "@root/file/service/files.service"
import { paginate } from "@root/shared/pagination"
import { CelebMainPageStatus } from "@root/shared/enum/system"
import { User } from "@root/shared/interface/user"
import { CreateCelebPicturesDto, UpdateCelebPicturesDto } from "@root/system/dto/celeb-pictures.dto"
import { CelebPictures } from "@root/system/entities/celeb-pictures.entity"
import { CelebPicturesQueryDto } from "@root/system/dto/celeb-pictures-query.dto"

@Injectable()
export class CelebPicturesService {
  constructor(
    @InjectRepository(CelebPictures) private repository: Repository<CelebPictures>,
    @Inject(forwardRef(() => FileService)) private readonly fileService: FileService,
  ) {}

  async create(dto: CreateCelebPicturesDto) {
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    const imageEN = dto.imageENId ? await this.fileService.findOne(dto.imageENId) : undefined
    const imageZH = dto.imageZHId ? await this.fileService.findOne(dto.imageZHId) : undefined
    const imageZHTW = dto.imageZHTWId ? await this.fileService.findOne(dto.imageZHTWId) : undefined
    const imageJA = dto.imageJAId ? await this.fileService.findOne(dto.imageJAId) : undefined
    const imageTH = dto.imageTHId ? await this.fileService.findOne(dto.imageTHId) : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(image && { image: image }),
        ...(imageEN && { imageEN: imageEN }),
        ...(imageZH && { imageZH: imageZH }),
        ...(imageZHTW && { imageZHTW: imageZHTW }),
        ...(imageJA && { imageJA: imageJA }),
        ...(imageTH && { imageTH: imageTH }),
      }),
    )
  }

  async findManyWithPaginationQuery(query?: CelebPicturesQueryDto) {
    const findOptions = <FindManyOptions<CelebPictures>>{
      where: {
        ...(query?.status && { status: query.status }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<CelebPictures>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAllActive() {
    return this.repository.find({ where: { status: CelebMainPageStatus.ACTIVE } })
  }

  async update(id: string, dto: UpdateCelebPicturesDto, user?: User) {
    const CelebPictures = await this.findOne(id)
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    const imageEN = dto.imageENId ? await this.fileService.findOne(dto.imageENId) : undefined
    const imageZH = dto.imageZHId ? await this.fileService.findOne(dto.imageZHId) : undefined
    const imageZHTW = dto.imageZHTWId ? await this.fileService.findOne(dto.imageZHTWId) : undefined
    const imageJA = dto.imageJAId ? await this.fileService.findOne(dto.imageJAId) : undefined
    const imageTH = dto.imageTHId ? await this.fileService.findOne(dto.imageTHId) : undefined
    return this.repository.save(
      Object.assign(CelebPictures, dto, {
        updatedBy: user?.id,
        ...(image && { image: image }),
        ...(imageEN && { imageEN: imageEN }),
        ...(imageZH && { imageZH: imageZH }),
        ...(imageZHTW && { imageZHTW: imageZHTW }),
        ...(imageJA && { imageJA: imageJA }),
        ...(imageTH && { imageTH: imageTH }),
      }),
    )
  }

  async remove(id: string) {
    const CelebPictures = await this.findOne(id)
    return this.repository.remove(CelebPictures)
  }
}
