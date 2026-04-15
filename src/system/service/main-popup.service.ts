import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Raw, Repository } from "typeorm"
import { FileService } from "@root/file/service/files.service"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { MainPopup } from "@root/system/entities/main-popup.entity"
import { MainPopupStatus } from "@root/shared/enum/system"
import { CreateMainPopupDto, UpdateMainPopupDto } from "@root/system/dto/main-popup.dto"
import { MainPopupQueryDto } from "@root/system/dto/main-popup-query.dto"

@Injectable()
export class MainPopupService {
  constructor(
    @InjectRepository(MainPopup) private repository: Repository<MainPopup>,
    @Inject(forwardRef(() => FileService)) private readonly fileService: FileService,
  ) {}

  async create(dto: CreateMainPopupDto) {
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

  async findManyWithPaginationQuery(query?: MainPopupQueryDto) {
    const isActiveOnly = query?.status === MainPopupStatus.ACTIVE
    const findOptions = <FindManyOptions<MainPopup>>{
      where: {
        ...(query?.status && { status: query.status }),
        ...(isActiveOnly && {
          startDate: Raw((alias) => `(${alias} IS NULL OR ${alias} <= NOW())`),
          endDate: Raw((alias) => `(${alias} IS NULL OR ${alias} >= NOW())`),
        }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<MainPopup>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAllActive() {
    return this.repository.find({ where: { status: MainPopupStatus.ACTIVE } })
  }

  async update(id: string, dto: UpdateMainPopupDto, user?: User) {
    const mainPopup = await this.findOne(id)
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    const imageEN = dto.imageENId ? await this.fileService.findOne(dto.imageENId) : undefined
    const imageZH = dto.imageZHId ? await this.fileService.findOne(dto.imageZHId) : undefined
    const imageZHTW = dto.imageZHTWId ? await this.fileService.findOne(dto.imageZHTWId) : undefined
    const imageJA = dto.imageJAId ? await this.fileService.findOne(dto.imageJAId) : undefined
    const imageTH = dto.imageTHId ? await this.fileService.findOne(dto.imageTHId) : undefined
    return this.repository.save(
      Object.assign(mainPopup, dto, {
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
    const mainPopup = await this.findOne(id)
    return this.repository.remove(mainPopup)
  }
}
