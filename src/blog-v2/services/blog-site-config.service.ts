import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogSiteConfig } from "@root/blog-v2/entities/site-config.entity"
import { UpdateSiteConfigDto } from "@root/blog-v2/dto/site-config.dto"
import { User } from "@root/shared/interface/user"

const SITE = "peche"

@Injectable()
export class BlogSiteConfigService {
  constructor(
    @InjectRepository(BlogSiteConfig) private readonly repo: Repository<BlogSiteConfig>,
  ) {}

  /** 사이트 공통 정보 1행. 없으면 기본 행 생성. */
  async get(): Promise<BlogSiteConfig> {
    let row = await this.repo.findOne({ where: { targetSite: SITE } })
    if (!row) {
      row = this.repo.create({ targetSite: SITE, organizationType: "MedicalClinic" })
      row = await this.repo.save(row)
    }
    return row
  }

  async update(dto: UpdateSiteConfigDto, user: User): Promise<BlogSiteConfig> {
    const row = await this.get()
    Object.assign(row, dto, { updatedBy: user?.id })
    if (!row.createdBy) row.createdBy = user?.id
    return this.repo.save(row)
  }
}
