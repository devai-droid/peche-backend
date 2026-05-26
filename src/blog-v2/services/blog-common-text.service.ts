import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogCommonText, BlogCommonTextType } from "@root/blog-v2/entities/common-text.entity"
import { UpdateCommonTextDto } from "@root/blog-v2/dto/common-text.dto"
import { User } from "@root/shared/interface/user"

const SITE = "peche"
const DEFAULT_LANG = "ko"
const ALL_TYPES = Object.values(BlogCommonTextType)

@Injectable()
export class BlogCommonTextService {
  constructor(
    @InjectRepository(BlogCommonText) private readonly repo: Repository<BlogCommonText>,
  ) {}

  /** 어드민용: 해당 언어의 4종 전부(없는 type은 빈 항목). */
  async findAllForAdmin(lang = DEFAULT_LANG): Promise<BlogCommonText[]> {
    const rows = await this.repo.find({ where: { targetSite: SITE, lang } })
    const byType = new Map(rows.map((r) => [r.type, r]))
    return ALL_TYPES.map(
      (type) =>
        byType.get(type) ??
        this.repo.create({ targetSite: SITE, lang, type, body: "", isActive: true }),
    )
  }

  /** 공개용: 해당 언어의 활성 고지문구. 없는 type은 기본 언어(ko)로 폴백. */
  async findActive(lang = DEFAULT_LANG): Promise<BlogCommonText[]> {
    const rows = await this.repo.find({ where: { targetSite: SITE, lang, isActive: true } })
    const have = new Set(rows.map((r) => r.type))
    if (lang !== DEFAULT_LANG) {
      const base = await this.repo.find({ where: { targetSite: SITE, lang: DEFAULT_LANG, isActive: true } })
      for (const b of base) if (!have.has(b.type)) rows.push(b)
    }
    return rows
  }

  async upsert(
    lang: string,
    type: BlogCommonTextType,
    dto: UpdateCommonTextDto,
    user: User,
  ): Promise<BlogCommonText> {
    let entity = await this.repo.findOne({ where: { targetSite: SITE, lang, type } })
    if (!entity) entity = this.repo.create({ targetSite: SITE, lang, type, isActive: true })
    if (dto.body !== undefined) entity.body = dto.body
    if (dto.isActive !== undefined) entity.isActive = dto.isActive
    entity.updatedBy = user?.id
    if (!entity.createdBy) entity.createdBy = user?.id
    return this.repo.save(entity)
  }
}
