import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogCommonText, BlogCommonTextType } from "@root/blog-v2/entities/common-text.entity"
import { UpdateCommonTextDto } from "@root/blog-v2/dto/common-text.dto"
import { User } from "@root/shared/interface/user"

const SITE = "peche"
const ALL_TYPES = Object.values(BlogCommonTextType)

@Injectable()
export class BlogCommonTextService {
  constructor(
    @InjectRepository(BlogCommonText) private readonly repo: Repository<BlogCommonText>,
  ) {}

  /** 어드민용: 4종 전부 반환(없는 type은 빈 항목으로 채워 일관된 편집 UI 제공). */
  async findAllForAdmin(): Promise<BlogCommonText[]> {
    const rows = await this.repo.find({ where: { targetSite: SITE } })
    const byType = new Map(rows.map((r) => [r.type, r]))
    return ALL_TYPES.map(
      (type) =>
        byType.get(type) ??
        this.repo.create({ targetSite: SITE, type, body: "", isActive: true }),
    )
  }

  /** 공개용: 활성화된 고지문구만. */
  async findActive(): Promise<BlogCommonText[]> {
    return this.repo.find({ where: { targetSite: SITE, isActive: true } })
  }

  async upsert(type: BlogCommonTextType, dto: UpdateCommonTextDto, user: User): Promise<BlogCommonText> {
    let entity = await this.repo.findOne({ where: { targetSite: SITE, type } })
    if (!entity) entity = this.repo.create({ targetSite: SITE, type, isActive: true })
    if (dto.body !== undefined) entity.body = dto.body
    if (dto.isActive !== undefined) entity.isActive = dto.isActive
    entity.updatedBy = user?.id
    if (!entity.createdBy) entity.createdBy = user?.id
    return this.repo.save(entity)
  }
}
