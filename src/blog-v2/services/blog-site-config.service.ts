import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogSiteConfig } from "@root/blog-v2/entities/site-config.entity"
import { BlogSiteConfigI18n } from "@root/blog-v2/entities/site-config-i18n.entity"
import { UpdateSiteConfigDto } from "@root/blog-v2/dto/site-config.dto"
import { User } from "@root/shared/interface/user"

const SITE = "peche"
const DEFAULT_LANG = "ko"

// 언어별로 덮어쓰는 표시값 (공통 식별값 url/@id/type/telephone/geo/진료과목 은 제외)
const LOCALIZABLE: (keyof BlogSiteConfigI18n)[] = [
  "hospitalName",
  "addressStreet",
  "addressLocality",
  "addressRegion",
  "addressCountry",
  "sameAs",
  "knowsAbout",
  "certifications",
]

@Injectable()
export class BlogSiteConfigService {
  constructor(
    @InjectRepository(BlogSiteConfig) private readonly repo: Repository<BlogSiteConfig>,
    @InjectRepository(BlogSiteConfigI18n) private readonly i18nRepo: Repository<BlogSiteConfigI18n>,
  ) {}

  /** 기본(공통+ko) 행. 없으면 생성. */
  async getBase(): Promise<BlogSiteConfig> {
    let row = await this.repo.findOne({ where: { targetSite: SITE } })
    if (!row) {
      row = this.repo.create({ targetSite: SITE, organizationType: "MedicalClinic" })
      row = await this.repo.save(row)
    }
    return row
  }

  /** 어드민 편집용: 해당 언어 오버라이드 행(없으면 빈 객체). */
  async getI18n(lang: string): Promise<Partial<BlogSiteConfigI18n>> {
    const row = await this.i18nRepo.findOne({ where: { targetSite: SITE, lang } })
    return row ?? { targetSite: SITE, lang }
  }

  /** 공개/프론트용: 공통값 + 해당 언어 표시값 병합. */
  async getMerged(lang = DEFAULT_LANG): Promise<BlogSiteConfig> {
    const base = await this.getBase()
    if (lang === DEFAULT_LANG) return base
    const i18n = await this.i18nRepo.findOne({ where: { targetSite: SITE, lang } })
    if (!i18n) return base
    const merged = { ...base } as BlogSiteConfig
    for (const k of LOCALIZABLE) {
      const v = i18n[k]
      if (Array.isArray(v) ? v.length > 0 : v != null && v !== "") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(merged as any)[k] = v
      }
    }
    return merged
  }

  async updateBase(dto: UpdateSiteConfigDto, user: User): Promise<BlogSiteConfig> {
    const row = await this.getBase()
    Object.assign(row, dto, { updatedBy: user?.id })
    if (!row.createdBy) row.createdBy = user?.id
    return this.repo.save(row)
  }

  async updateI18n(lang: string, dto: UpdateSiteConfigDto, user: User): Promise<BlogSiteConfigI18n> {
    let row = await this.i18nRepo.findOne({ where: { targetSite: SITE, lang } })
    if (!row) row = this.i18nRepo.create({ targetSite: SITE, lang })
    for (const k of LOCALIZABLE) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v = (dto as any)[k]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (v !== undefined) (row as any)[k] = v
    }
    row.updatedBy = user?.id
    if (!row.createdBy) row.createdBy = user?.id
    return this.i18nRepo.save(row)
  }
}
