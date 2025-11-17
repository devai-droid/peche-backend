import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { FileService } from "@root/file/service/files.service"
import { paginate } from "@root/shared/pagination"
import { EquipmentStatus } from "@root/shared/enum/system"
import { User } from "@root/shared/interface/user"
import { EquipmentQueryDto } from "@root/system/dto/equipment-query.dto"
import { CreateEquipmentDto, UpdateEquipmentDto } from "@root/system/dto/equipment.dto"
import { Equipment } from "@root/system/entities/equipment.entity"

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment) private repository: Repository<Equipment>,
    @Inject(forwardRef(() => FileService)) private readonly fileService: FileService,
  ) {}

  async create(dto: CreateEquipmentDto) {
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(image && { image: image }),
      }),
    )
  }

  async findManyWithPaginationQuery(query?: EquipmentQueryDto) {
    const findOptions = <FindManyOptions<Equipment>>{
      where: {
        ...(query?.status && { status: query.status }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<Equipment>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAllActive() {
    return this.repository.find({ where: { status: EquipmentStatus.ACTIVE } })
  }

  async update(id: string, dto: UpdateEquipmentDto, user?: User) {
    const equipment = await this.findOne(id)
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    return this.repository.save(
      Object.assign(equipment, dto, {
        updatedBy: user?.id,
        ...(image && { image: image }),
      }),
    )
  }

  async remove(id: string) {
    const equipment = await this.findOne(id)
    return this.repository.remove(equipment)
  }
}
