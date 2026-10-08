import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindOptionsWhere, Repository } from "typeorm"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { CreateBlogDoctorDto, QueryBlogDoctorDto, UpdateBlogDoctorDto } from "@root/blog-v2/dto/doctor.dto"
import { User } from "@root/shared/interface/user"
import { PiSyncService } from "@root/pi/pi-sync.service"

@Injectable()
export class BlogDoctorService {
  constructor(
    @InjectRepository(BlogDoctor) private readonly repo: Repository<BlogDoctor>,
    private readonly piSync: PiSyncService,
  ) {}

  async create(dto: CreateBlogDoctorDto, user: User): Promise<BlogDoctor> {
    const entity = this.repo.create({
      ...dto,
      lang: dto.lang || "ko",
      isVisible: dto.isVisible ?? true,
      targetSite: "peche",
      createdBy: user?.id,
      updatedBy: user?.id,
    })
    const saved = await this.repo.save(entity)
    await this.piSync.syncSafe("doctor.create")
    return saved
  }

  async findMany(query: QueryBlogDoctorDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 50
    const qb = this.repo.createQueryBuilder("d").orderBy("d.createdAt", "DESC")

    if (query.lang) qb.andWhere("d.lang = :lang", { lang: query.lang })
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

  /**
   * 대표 의료진 1명 (블로그 글 하단 공통 의료진 카드용).
   * 글에 author_doctor가 지정 안 된 경우 이 의료진으로 카드를 채운다.
   * 우선순위: '블로그 카드 연결(linkedToBlogCard)' 켠 의료진 → (없으면) 노출 의료진 중 최초 등록.
   * 각 단계는 해당 언어 → 기본 언어(ko) 순으로 폴백.
   */
  async findRepresentative(lang = "ko"): Promise<BlogDoctor | null> {
    const pick = (where: FindOptionsWhere<BlogDoctor>) =>
      this.repo.findOne({ where: { targetSite: "peche", ...where }, order: { createdAt: "ASC" } })

    return (
      (await pick({ isVisible: true, linkedToBlogCard: true, lang })) ||
      (lang !== "ko" ? await pick({ isVisible: true, linkedToBlogCard: true, lang: "ko" }) : null) ||
      (await pick({ isVisible: true, lang })) ||
      (lang !== "ko" ? await pick({ isVisible: true, lang: "ko" }) : null)
    )
  }

  /**
   * 공개 의료진 목록 (챗봇·외부 연동용). 노출(isVisible) 의료진을 등록순으로 반환.
   * 해당 언어가 하나도 없으면 기본 언어(ko)로 폴백.
   */
  async findPublicList(lang = "ko"): Promise<BlogDoctor[]> {
    const byLang = await this.repo.find({
      where: { isVisible: true, targetSite: "peche", lang },
      order: { createdAt: "ASC" },
    })
    if (byLang.length > 0 || lang === "ko") return byLang
    return this.repo.find({
      where: { isVisible: true, targetSite: "peche", lang: "ko" },
      order: { createdAt: "ASC" },
    })
  }

  async update(id: string, dto: UpdateBlogDoctorDto, user: User): Promise<BlogDoctor> {
    const found = await this.findOne(id)
    Object.assign(found, dto, { updatedBy: user?.id })
    const saved = await this.repo.save(found)
    await this.piSync.syncSafe("doctor.update")
    return saved
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete({ id })
    if (result.affected === 0) throw new NotFoundException(`doctor ${id} not found`)
    await this.piSync.syncSafe("doctor.remove")
  }
}
