import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogKeyword } from "@root/blog-v2/entities/keyword.entity"
import { CreateBlogKeywordDto, QueryBlogKeywordDto, UpdateBlogKeywordDto } from "@root/blog-v2/dto/keyword.dto"
import { User } from "@root/shared/interface/user"

@Injectable()
export class BlogKeywordService {
  constructor(@InjectRepository(BlogKeyword) private readonly repo: Repository<BlogKeyword>) {}

  async create(dto: CreateBlogKeywordDto, user: User): Promise<BlogKeyword> {
    const entity = this.repo.create({
      ...dto,
      targetSite: "peche",
      createdBy: user?.id,
      updatedBy: user?.id,
    })
    return this.repo.save(entity)
  }

  async findMany(query: QueryBlogKeywordDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 50
    const qb = this.repo.createQueryBuilder("k").orderBy("k.createdAt", "DESC")

    if (query.productCategoryId) qb.andWhere("k.product_category_id = :pid", { pid: query.productCategoryId })
    if (query.q) qb.andWhere("(k.keyword ILIKE :q OR k.description ILIKE :q)", { q: `%${query.q}%` })

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount()
    return { items, total, page, limit }
  }

  async findOne(id: string): Promise<BlogKeyword> {
    const found = await this.repo.findOne({ where: { id } })
    if (!found) throw new NotFoundException(`keyword ${id} not found`)
    return found
  }

  async update(id: string, dto: UpdateBlogKeywordDto, user: User): Promise<BlogKeyword> {
    const found = await this.findOne(id)
    Object.assign(found, dto, { updatedBy: user?.id })
    return this.repo.save(found)
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete({ id })
    if (result.affected === 0) throw new NotFoundException(`keyword ${id} not found`)
  }
}
