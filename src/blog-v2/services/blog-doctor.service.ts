import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { CreateBlogDoctorDto, QueryBlogDoctorDto, UpdateBlogDoctorDto } from "@root/blog-v2/dto/doctor.dto"
import { User } from "@root/shared/interface/user"

@Injectable()
export class BlogDoctorService {
  constructor(@InjectRepository(BlogDoctor) private readonly repo: Repository<BlogDoctor>) {}

  async create(dto: CreateBlogDoctorDto, user: User): Promise<BlogDoctor> {
    const entity = this.repo.create({
      ...dto,
      isVisible: dto.isVisible ?? true,
      targetSite: "peche",
      createdBy: user?.id,
      updatedBy: user?.id,
    })
    return this.repo.save(entity)
  }

  async findMany(query: QueryBlogDoctorDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 50
    const qb = this.repo.createQueryBuilder("d").orderBy("d.createdAt", "DESC")

    if (query.visibleOnly) qb.andWhere("d.is_visible = true")
    if (query.q) qb.andWhere("(d.name ILIKE :q OR d.specialty ILIKE :q OR d.job_title ILIKE :q)", { q: `%${query.q}%` })

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount()
    return { items, total, page, limit }
  }

  async findOne(id: string): Promise<BlogDoctor> {
    const found = await this.repo.findOne({ where: { id } })
    if (!found) throw new NotFoundException(`doctor ${id} not found`)
    return found
  }

  async update(id: string, dto: UpdateBlogDoctorDto, user: User): Promise<BlogDoctor> {
    const found = await this.findOne(id)
    Object.assign(found, dto, { updatedBy: user?.id })
    return this.repo.save(found)
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete({ id })
    if (result.affected === 0) throw new NotFoundException(`doctor ${id} not found`)
  }
}
