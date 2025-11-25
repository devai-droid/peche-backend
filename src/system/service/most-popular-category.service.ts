import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { MostPopularCategory } from "../entities/most-popular-category.entity"
import { CreateMostPopularCategoryDto, UpdateMostPopularCategoryDto } from "../dto/most-popular-category.dto"
import { User } from "@root/shared/interface/user"

@Injectable()
export class MostPopularCategoryService {
  constructor(
    @InjectRepository(MostPopularCategory)
    private repo: Repository<MostPopularCategory>,
  ) {}

  findAll() {
    return this.repo.find({
      relations: ["items"],
      order: { order: "ASC" },
    })
  }

  async findOne(id: string) {
    return this.repo.findOneOrFail({
      where: { id },
      relations: ["items"],
    })
  }

  create(dto: CreateMostPopularCategoryDto) {
    return this.repo.save(dto)
  }

  update(id: string, dto: UpdateMostPopularCategoryDto, user?: User) {
    return this.repo.save({ id, ...dto })
  }

  remove(id: string) {
    return this.repo.delete(id)
  }
}
