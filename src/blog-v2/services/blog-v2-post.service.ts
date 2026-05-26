import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogPostV2 } from "@root/blog-v2/entities/post.entity"
import { BlogPostCitation } from "@root/blog-v2/entities/post-citation.entity"
import { BlogPostSlugHistory } from "@root/blog-v2/entities/post-slug-history.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { BlogKeyword } from "@root/blog-v2/entities/keyword.entity"
import { BlogSlugService } from "@root/blog-v2/services/slug.service"
import { BlogSummaryService } from "@root/blog-v2/services/summary.service"
import { BlogImageUploadService } from "@root/blog-v2/services/blog-image-upload.service"
import { BlogPostLang, BlogPostStatus } from "@root/blog-v2/enum/blog-v2.enum"
import {
  extractSummaryFromBody,
  parseBlogMarkdown,
  parseMedicalSchema,
  renderMarkdownToHtml,
} from "@root/blog-v2/utils/markdown.util"
import { UploadBlogPostDto } from "@root/blog-v2/dto/upload-blog-post.dto"
import { QueryBlogPostDto } from "@root/blog-v2/dto/query-blog-post.dto"
import { User } from "@root/shared/interface/user"
import { PECHE_SITE } from "@root/blog-v2/sites/peche.config"

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

@Injectable()
export class BlogV2PostService {
  private readonly logger = new Logger(BlogV2PostService.name)

  constructor(
    @InjectRepository(BlogPostV2) private readonly postRepo: Repository<BlogPostV2>,
    @InjectRepository(BlogPostCitation) private readonly citationRepo: Repository<BlogPostCitation>,
    @InjectRepository(BlogPostSlugHistory) private readonly historyRepo: Repository<BlogPostSlugHistory>,
    @InjectRepository(BlogDoctor) private readonly doctorRepo: Repository<BlogDoctor>,
    @InjectRepository(BlogKeyword) private readonly keywordRepo: Repository<BlogKeyword>,
    private readonly slugService: BlogSlugService,
    private readonly summaryService: BlogSummaryService,
    private readonly imageUpload: BlogImageUploadService,
  ) {}

  /**
   * multipart로 받은 .md + 이미지 파일들 → 이미지 S3 업로드 + 본문/썸네일 URL 치환 → 초안 저장.
   */
  async uploadFromFiles(files: Express.Multer.File[], user: User): Promise<{ id: string; slug: string; status: string; warnings: string[] }> {
    const mdFile = files.find((f) => f.originalname.toLowerCase().endsWith(".md"))
    if (!mdFile) throw new BadRequestException(".md 파일이 multipart에 없음")

    const attachments = files.filter((f) => f !== mdFile)
    const rawMarkdown = mdFile.buffer.toString("utf-8")
    const urlMap = await this.imageUpload.uploadAttachments(attachments)
    const bodyReplaced = this.imageUpload.replacePaths(rawMarkdown, urlMap)

    return this.createFromMarkdown(bodyReplaced, user, urlMap)
  }

  /** 마크다운 텍스트만 업로드 (이미지 없음). */
  async upload(dto: UploadBlogPostDto, user: User): Promise<{ id: string; slug: string; status: string; warnings: string[] }> {
    return this.createFromMarkdown(dto.markdown, user)
  }

  /**
   * 기존 글 재업로드(수정). 목록에서 글을 선택 → 새 .md(+이미지)로 그 글을 덮어쓴다.
   * createdAt(시스템 최초 등록일)·publishedAt(최초 작성일)은 유지, updatedAt(최근 수정일)만 갱신.
   */
  async updateFromFiles(
    id: string,
    files: Express.Multer.File[],
    user: User,
  ): Promise<{ id: string; slug: string; status: string; warnings: string[] }> {
    const mdFile = files.find((f) => f.originalname.toLowerCase().endsWith(".md"))
    if (!mdFile) throw new BadRequestException(".md 파일이 multipart에 없음")

    const attachments = files.filter((f) => f !== mdFile)
    const rawMarkdown = mdFile.buffer.toString("utf-8")
    const urlMap = await this.imageUpload.uploadAttachments(attachments)
    const bodyReplaced = this.imageUpload.replacePaths(rawMarkdown, urlMap)

    return this.updateFromMarkdown(id, bodyReplaced, user, urlMap)
  }

  /**
   * 기존 글에 새 마크다운을 반영(수정). 본문/메타/스키마 전부 새 파일 기준으로 갱신하되,
   * - createdAt(최초 등록일): TypeORM @CreateDateColumn → 변경 안 됨
   * - publishedAt(최초 작성일): 기존 값 유지(없을 때만 frontmatter로 채움)
   * - updatedAt(최근 수정일): 저장 시 자동 갱신
   * - status: 기존 상태 유지(발행 글은 발행 유지)
   */
  private async updateFromMarkdown(
    id: string,
    markdown: string,
    user: User,
    urlMap?: Map<string, string>,
  ): Promise<{ id: string; slug: string; status: string; warnings: string[] }> {
    const post = await this.findOne(id)
    const { frontmatter, bodyMd } = parseBlogMarkdown(markdown)
    const warnings: string[] = []

    if (!frontmatter.title) throw new BadRequestException("frontmatter.title 필수")
    if (!bodyMd) throw new BadRequestException("본문 비어있음")

    const authorDoctorId =
      frontmatter.author_doctor_id ?? (await this.resolveDoctorId(frontmatter.author_doctor, warnings))
    const keywordId =
      frontmatter.keyword_id ??
      (await this.resolveKeywordId(frontmatter.topic_keyword ?? frontmatter.keyword, warnings))
    const productCategoryId =
      frontmatter.product_category_id ??
      (await this.resolveProductCategoryId(frontmatter.product_category ?? frontmatter.department, warnings))

    const thumbnailUrl = urlMap
      ? this.imageUpload.resolveSingle(frontmatter.thumbnail, urlMap)
      : frontmatter.thumbnail

    const summaryText =
      frontmatter.summary ?? frontmatter.meta_description ?? extractSummaryFromBody(bodyMd) ?? undefined

    const extraJsonld = parseMedicalSchema(frontmatter.medical_schema ?? frontmatter.main_schema)
    if ((frontmatter.medical_schema || frontmatter.main_schema) && !extraJsonld) {
      warnings.push("medical_schema JSON 파싱 실패 — extra_jsonld 미저장")
    }

    // slug 변경 시 history 기록(301 리다이렉트용)
    const newSlug = frontmatter.slug || post.slug
    if (newSlug !== post.slug) {
      await this.recordSlugChange(post.id, post.slug, post.lang)
    }

    post.title = frontmatter.title
    post.subtitle = frontmatter.subtitle
    post.bodyMd = bodyMd
    post.bodyHtml = renderMarkdownToHtml(bodyMd)
    if (thumbnailUrl) post.thumbnailUrl = thumbnailUrl
    post.lang = (frontmatter.lang as BlogPostLang) ?? post.lang
    post.topicKeyword = frontmatter.topic_keyword ?? frontmatter.keyword
    post.mainKeyword = frontmatter.title_keyword ?? frontmatter.main_keyword
    post.subKeywords =
      frontmatter.content_keywords ?? frontmatter.meta_keywords ?? frontmatter.sub_keywords
    post.summaryText = summaryText ?? post.summaryText
    post.slug = newSlug
    post.keywordId = keywordId
    post.productCategoryId = productCategoryId
    post.authorDoctorId = authorDoctorId
    post.schemaType = frontmatter.schema_type
    post.extraJsonld = extraJsonld ?? undefined
    post.internalLinks = Array.isArray(frontmatter.internal_links)
      ? frontmatter.internal_links.map((l) => ({ anchor: l.anchor, slug: l.slug }))
      : undefined
    post.productPage = frontmatter.product_page
    // 최초 작성일(publishedAt)은 유지 — 없을 때만 frontmatter로 채움
    post.publishedAt =
      post.publishedAt ?? (frontmatter.published_at ? new Date(frontmatter.published_at) : undefined)
    post.updatedBy = user?.id

    if (!post.summaryText) {
      const generated = await this.summaryService.generate({ title: post.title, bodyMd: post.bodyMd })
      if (generated) post.summaryText = generated
    }

    const saved = await this.postRepo.save(post)

    // 인용: 기존 전부 삭제 후 새 frontmatter 기준으로 재등록
    await this.citationRepo.delete({ postId: saved.id })
    if (Array.isArray(frontmatter.citations) && frontmatter.citations.length > 0) {
      const citations = frontmatter.citations
        .filter((c) => c?.url)
        .map((c, i) =>
          this.citationRepo.create({
            postId: saved.id,
            url: c.url,
            title: c.title,
            publisher: c.publisher,
            quote: c.quote,
            orderNum: i,
          }),
        )
      if (citations.length > 0) await this.citationRepo.save(citations)
    }

    return { id: saved.id, slug: saved.slug, status: saved.status, warnings }
  }

  /**
   * 마크다운 → frontmatter 매핑(이름→ID) + 자동 hook(slug/summary) → 초안 저장.
   * 매핑 실패는 발행 막지 않고 warnings로 반환 (graceful).
   */
  private async createFromMarkdown(
    markdown: string,
    user: User,
    urlMap?: Map<string, string>,
  ): Promise<{ id: string; slug: string; status: string; warnings: string[] }> {
    const { frontmatter, bodyMd } = parseBlogMarkdown(markdown)
    const warnings: string[] = []

    if (!frontmatter.title) throw new BadRequestException("frontmatter.title 필수")
    if (!bodyMd) throw new BadRequestException("본문 비어있음")

    // 이름 → ID 매핑 (직접 ID 입력이 있으면 우선)
    const authorDoctorId =
      frontmatter.author_doctor_id ?? (await this.resolveDoctorId(frontmatter.author_doctor, warnings))
    const keywordId =
      frontmatter.keyword_id ??
      (await this.resolveKeywordId(frontmatter.topic_keyword ?? frontmatter.keyword, warnings))
    // 시술 대분류: department(시술 중심 사이트는 시술 대분류명) → public.product_category 매칭
    // → 전체시술 페이지의 해당 대분류 안에 글이 노출됨
    const productCategoryId =
      frontmatter.product_category_id ??
      (await this.resolveProductCategoryId(frontmatter.product_category ?? frontmatter.department, warnings))

    // 썸네일: 업로드 맵에서 해결, 없으면 frontmatter 원본
    const thumbnailUrl = urlMap
      ? this.imageUpload.resolveSingle(frontmatter.thumbnail, urlMap)
      : frontmatter.thumbnail

    // 핵심 요약: frontmatter 우선 → 본문 ## 💡 핵심 요약 → (없으면 LLM fallback)
    const summaryText =
      frontmatter.summary ?? frontmatter.meta_description ?? extractSummaryFromBody(bodyMd) ?? undefined

    // medical_schema / main_schema → extra_jsonld (마케터가 작성한 글별 스키마 JSON)
    const extraJsonld = parseMedicalSchema(frontmatter.medical_schema ?? frontmatter.main_schema)
    if ((frontmatter.medical_schema || frontmatter.main_schema) && !extraJsonld) {
      warnings.push("medical_schema JSON 파싱 실패 — extra_jsonld 미저장")
    }

    const lang = (frontmatter.lang as BlogPostLang) ?? BlogPostLang.KO
    const post = this.postRepo.create({
      title: frontmatter.title,
      subtitle: frontmatter.subtitle,
      bodyMd,
      bodyHtml: renderMarkdownToHtml(bodyMd),
      thumbnailUrl,
      lang,
      status: BlogPostStatus.DRAFT,
      targetSite: "peche",
      topicKeyword: frontmatter.topic_keyword ?? frontmatter.keyword,
      mainKeyword: frontmatter.title_keyword ?? frontmatter.main_keyword,
      subKeywords:
        frontmatter.content_keywords ?? frontmatter.meta_keywords ?? frontmatter.sub_keywords,
      summaryText,
      slug: frontmatter.slug,
      keywordId,
      productCategoryId,
      authorDoctorId,
      schemaType: frontmatter.schema_type,
      extraJsonld: extraJsonld ?? undefined,
      internalLinks: Array.isArray(frontmatter.internal_links)
        ? frontmatter.internal_links.map((l) => ({ anchor: l.anchor, slug: l.slug }))
        : undefined,
      productPage: frontmatter.product_page,
      publishedAt: frontmatter.published_at ? new Date(frontmatter.published_at) : undefined,
      createdBy: user?.id,
      updatedBy: user?.id,
    })

    if (!post.slug) {
      post.slug = await this.slugService.generateUniqueSlug({
        title: post.title,
        content: post.bodyMd,
        lang: post.lang,
        productCategoryId: post.productCategoryId,
        keyword: post.mainKeyword,
      })
    }

    if (!post.summaryText) {
      const generated = await this.summaryService.generate({ title: post.title, bodyMd: post.bodyMd })
      if (generated) post.summaryText = generated
    }

    // 같은 slug+언어 글이 이미 있으면 → 무의미한 500 대신 명확한 안내(수정 재업로드 유도)
    const dup = await this.postRepo.findOne({ where: { slug: post.slug, lang: post.lang } })
    if (dup) {
      throw new BadRequestException(
        `이미 같은 주소(slug)의 글이 있습니다: "${post.slug}" (${post.lang}). ` +
          `'새 글 업로드'가 아니라 블로그 글 목록에서 해당 글의 '수정(재업로드)'을 사용하세요. ` +
          `정말 새 글이면 .md의 slug를 다른 값으로 바꿔주세요.`,
      )
    }

    const saved = await this.postRepo.save(post)

    if (Array.isArray(frontmatter.citations) && frontmatter.citations.length > 0) {
      const citations = frontmatter.citations
        .filter((c) => c?.url)
        .map((c, i) =>
          this.citationRepo.create({
            postId: saved.id,
            url: c.url,
            title: c.title,
            publisher: c.publisher,
            quote: c.quote,
            orderNum: i,
          }),
        )
      if (citations.length > 0) await this.citationRepo.save(citations)
    }

    // 발행된 글 수정 시 검색엔진 재색인 요청(GEO/AEO 최신화). 초안은 발행 시 핑.
    if (saved.status === BlogPostStatus.PUBLISHED) this.pingIndexNow(saved)

    return { id: saved.id, slug: saved.slug, status: saved.status, warnings }
  }

  /** 감수의사 이름 → blog.doctors ID. 못 찾으면 경고 + undefined (발행 진행). */
  private async resolveDoctorId(name: string | undefined, warnings: string[]): Promise<string | undefined> {
    if (!name) return undefined
    const doc = await this.doctorRepo
      .createQueryBuilder("d")
      .where("d.name = :name OR :name ILIKE d.name || ' %' OR d.name ILIKE :pattern", {
        name,
        pattern: `${name.split(" ")[0]}%`,
      })
      .getOne()
    if (!doc) {
      warnings.push(`감수의사 매칭 실패: "${name}" — 감수의사 풀에 먼저 등록 필요`)
      return undefined
    }
    return doc.id
  }

  /** 키워드 이름 → blog.keywords ID. 못 찾으면 경고 + undefined. */
  private async resolveKeywordId(name: string | undefined, warnings: string[]): Promise<string | undefined> {
    if (!name) return undefined
    const kw = await this.keywordRepo.findOne({ where: { keyword: name } })
    if (!kw) {
      warnings.push(`키워드 매칭 실패: "${name}" — 키워드 풀에 먼저 등록 필요`)
      return undefined
    }
    return kw.id
  }

  /**
   * 시술 대분류명 → public.product_category id (읽기 전용 raw query, 운영 테이블 무손).
   * 전체시술 페이지의 해당 대분류 안에 글이 노출되도록 매칭.
   * 못 찾으면 경고 + undefined (발행 진행).
   */
  private async resolveProductCategoryId(name: string | undefined, warnings: string[]): Promise<string | undefined> {
    if (!name) return undefined
    const rows: Array<{ id: string }> = await this.postRepo.query(
      `SELECT id FROM public.product_category WHERE name = $1 AND status = 'ACTIVE' LIMIT 1`,
      [name],
    )
    if (!rows.length) {
      warnings.push(`시술 대분류 매칭 실패: "${name}" — 전체시술 페이지 대분류명과 정확히 일치해야 함`)
      return undefined
    }
    return rows[0].id
  }

  async findOne(id: string): Promise<BlogPostV2> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ["keyword", "authorDoctor"],
    })
    if (!post) throw new NotFoundException(`blog post ${id} not found`)
    return post
  }

  /** 공개 페이지용: slug + lang으로 조회 (관계 포함). */
  async findBySlug(slug: string, lang: string): Promise<BlogPostV2 | null> {
    return this.postRepo.findOne({
      where: { slug, lang: lang as BlogPostLang },
      relations: ["keyword", "authorDoctor"],
    })
  }

  /** 출처 인용 목록 (공개 페이지 citation). */
  async findCitations(postId: string): Promise<BlogPostCitation[]> {
    return this.citationRepo.find({ where: { postId }, order: { orderNum: "ASC" } })
  }

  async findMany(query: QueryBlogPostDto): Promise<PaginatedResult<BlogPostV2>> {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const qb = this.postRepo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.keyword", "keyword")
      .leftJoinAndSelect("p.authorDoctor", "authorDoctor")
      .orderBy("p.createdAt", "DESC")

    if (query.status) qb.andWhere("p.status = :status", { status: query.status })
    if (query.lang) qb.andWhere("p.lang = :lang", { lang: query.lang })
    if (query.productCategoryId) qb.andWhere("p.product_category_id = :pid", { pid: query.productCategoryId })
    if (query.keywordId) qb.andWhere("p.keyword_id = :kid", { kid: query.keywordId })
    if (query.productPage) qb.andWhere("p.product_page = :pp", { pp: query.productPage })
    if (query.productPageContains) {
      qb.andWhere("p.product_page ILIKE :ppc", { ppc: `%${query.productPageContains}%` })
    }
    if (query.q) {
      qb.andWhere("(p.title ILIKE :q OR p.summary_text ILIKE :q OR p.body_md ILIKE :q)", { q: `%${query.q}%` })
    }

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount()
    return { items, total, page, limit }
  }

  async remove(id: string): Promise<void> {
    const result = await this.postRepo.delete({ id })
    if (result.affected === 0) throw new NotFoundException(`blog post ${id} not found`)
  }

  async publish(id: string, user: User): Promise<BlogPostV2> {
    const post = await this.findOne(id)
    post.status = BlogPostStatus.PUBLISHED
    post.publishedAt = post.publishedAt ?? new Date()
    post.updatedBy = user?.id
    const saved = await this.postRepo.save(post)
    this.pingIndexNow(saved)
    return saved
  }

  /** 발행 시 IndexNow 색인 요청 (네이버·Bing). INDEXNOW_KEY 없으면 skip. 실패는 무시. */
  private pingIndexNow(post: BlogPostV2): void {
    const key = process.env.INDEXNOW_KEY
    if (!key) return
    const url = `${PECHE_SITE.baseUrl}/${post.lang}/blog/${encodeURIComponent(post.slug)}`
    fetch(`https://api.indexnow.org/IndexNow?url=${encodeURIComponent(url)}&key=${key}`)
      .then(() => this.logger.log(`IndexNow ping: ${url}`))
      .catch((e) => this.logger.warn(`IndexNow 실패: ${(e as Error).message}`))
  }

  async unpublish(id: string, user: User): Promise<BlogPostV2> {
    const post = await this.findOne(id)
    post.status = BlogPostStatus.DRAFT
    post.updatedBy = user?.id
    return this.postRepo.save(post)
  }

  /**
   * slug 변경 시 history에 old slug 기록 (301 리다이렉트용).
   * 단계 5에서 slug 수정 API 만들 때 호출.
   */
  async recordSlugChange(postId: string, oldSlug: string, lang: string): Promise<void> {
    await this.historyRepo.save(this.historyRepo.create({ postId, oldSlug, lang }))
  }
}
