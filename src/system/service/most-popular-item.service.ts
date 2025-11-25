import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { FileService } from "@root/file/service/files.service"
import { MostPopularItem } from "../entities/most-popular-item.entity"
import { MostPopularCategory } from "../entities/most-popular-category.entity"
import { CreateMostPopularItemDto, UpdateMostPopularItemDto } from "../dto/most-popular-item.dto"

@Injectable()
export class MostPopularItemService {
  constructor(
    @InjectRepository(MostPopularItem)
    private repo: Repository<MostPopularItem>,

    private fileService: FileService,
  ) {}

  async create(dto: CreateMostPopularItemDto) {
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined

    // 🎯 categoryId로 category 엔티티 불러오기
    const category = dto.categoryId
      ? await this.repo.manager.getRepository(MostPopularCategory).findOne({
          where: { id: dto.categoryId },
        })
      : undefined

    return this.repo.save({
      ...dto,
      ...(image && { image }),
      ...(category && { category }), // <= 이거 중요!
    })
  }

  async findAll() {
    return this.repo.find({
      relations: ["category", "image"],
      order: { order: "ASC" },
    })
  }

  async findOne(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ["category", "image"],
    })
  }

  async update(id: string, dto: UpdateMostPopularItemDto) {
    const existing = await this.repo.findOne({ where: { id } })

    // 🎯 category 관계 처리
    if (dto.categoryId) {
      const category = await this.repo.manager
        .getRepository(MostPopularCategory)
        .findOne({ where: { id: dto.categoryId } })
      existing.category = category
    } else if (dto.categoryId === null) {
      existing.category = null
    }

    // 이미지 삭제
    if (dto.imageId === null) {
      existing.image = null
    }
    // 이미지 변경
    else if (dto.imageId) {
      const image = await this.fileService.findOne(dto.imageId)
      existing.image = image
    }

    Object.assign(existing, dto)

    return this.repo.save(existing)
  }

  remove(id: string) {
    return this.repo.delete(id)
  }
}
