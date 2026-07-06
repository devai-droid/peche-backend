import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogPostV2 } from "@root/blog-v2/entities/post.entity"
import { BlogCommonTextType } from "@root/blog-v2/entities/common-text.entity"
import { BlogPostSlugHistory } from "@root/blog-v2/entities/post-slug-history.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { BlogKeyword } from "@root/blog-v2/entities/keyword.entity"
import { BlogSlugService } from "@root/blog-v2/services/slug.service"
import { BlogSummaryService } from "@root/blog-v2/services/summary.service"
import { BlogImageUploadService } from "@root/blog-v2/services/blog-image-upload.service"
import { BlogPostLang, BlogPostStatus, BlogPublishTarget } from "@root/blog-v2/enum/blog-v2.enum"
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

    if (!frontmatter.title || !bodyMd) {
      throw new BadRequestException("md 파일에 오류가 있습니다. 내용·형식을 확인해주세요.")
    }

    const authorDoctorId =
      frontmatter.author_doctor_id ??
      (await this.resolveDoctorId(frontmatter.author_doctor, (frontmatter.lang as string) || "ko", warnings))
    const keywordId =
      frontmatter.keyword_id ??
      (await this.resolveKeywordId(frontmatter.topic_keyword ?? frontmatter.keyword, warnings))
    const productCategoryId =
      frontmatter.product_category_id ??
      (await this.resolveProductCategoryId(frontmatter.product_category ?? frontmatter.department, warnings))

    const thumbnailUrl = urlMap
      ? this.imageUpload.resolveSingle(frontmatter.thumbnail, urlMap)
      : frontmatter.thumbnail

    // 폴더 업로드인데 경로가 안 맞아 못 올라간(상대경로로 남은) 로컬 이미지가 있으면 차단
    if (urlMap) this.assertImagesResolved(bodyMd, thumbnailUrl, frontmatter.thumbnail)

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
    post.publishTarget =
      frontmatter.publish_target === BlogPublishTarget.DETAIL_PAGE
        ? BlogPublishTarget.DETAIL_PAGE
        : BlogPublishTarget.BLOG
    // 고지문구 적용(notices)은 어드민 미리보기에서 수동 선택 — 재업로드 시 기존 선택 유지(덮어쓰지 않음)
    // 최초 작성일(publishedAt)은 유지 — 없을 때만 frontmatter로 채움
    post.publishedAt =
      post.publishedAt ?? (frontmatter.published_at ? new Date(frontmatter.published_at) : undefined)
    post.updatedBy = user?.id

    if (!post.summaryText) {
      const generated = await this.summaryService.generate({ title: post.title, bodyMd: post.bodyMd })
      if (generated) post.summaryText = generated
    }

    const saved = await this.postRepo.save(post)

    return { id: saved.id, slug: saved.slug, status: saved.status, warnings }
  }

  /**
   * 폴더 업로드 후 본문/썸네일에 업로드되지 못한(경로 불일치로 상대경로로 남은) 로컬 이미지가 있으면 차단.
   * 매칭된 이미지는 CloudFront 절대 URL로 치환되므로, http/https·data·외부 URL이 아닌 참조가 남아있으면 경로 불일치.
   */
  private assertImagesResolved(
    bodyMd: string,
    thumbnailUrl: string | undefined,
    thumbnailInput: string | undefined,
  ): void {
    const isLocal = (p?: string): boolean => !!p && !/^(https?:|data:|\/\/)/i.test(p.trim())
    const unresolved: string[] = []
    // 썸네일: 입력은 로컬인데 치환 후에도 로컬이면 매칭 실패
    if (isLocal(thumbnailInput) && isLocal(thumbnailUrl)) unresolved.push(thumbnailInput!)
    // 본문 이미지: ![alt](path) 중 로컬 경로가 남아있으면 매칭 실패
    const re = /!\[[^\]]*\]\(\s*<?([^)>]+)>?\s*\)/g
    let m: RegExpExecArray | null
    // eslint-disable-next-line no-cond-assign
    while ((m = re.exec(bodyMd))) {
      if (isLocal(m[1])) unresolved.push(m[1])
    }
    if (unresolved.length > 0) {
      throw new BadRequestException("이미지 경로가 일치하지 않습니다.")
    }
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

    if (!frontmatter.title || !bodyMd) {
      throw new BadRequestException("md 파일에 오류가 있습니다. 내용·형식을 확인해주세요.")
    }

    // 이름 → ID 매핑 (직접 ID 입력이 있으면 우선)
    const authorDoctorId =
      frontmatter.author_doctor_id ??
      (await this.resolveDoctorId(frontmatter.author_doctor, (frontmatter.lang as string) || "ko", warnings))
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

    // 폴더 업로드인데 경로가 안 맞아 못 올라간(상대경로로 남은) 로컬 이미지가 있으면 차단
    if (urlMap) this.assertImagesResolved(bodyMd, thumbnailUrl, frontmatter.thumbnail)

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
      // 고지문구: 일반 면책은 항상 적용(프론트에서 자동), AI 이미지 고지는 신규 글에 기본 등록.
      // frontmatter로 명시하면 그 값을 존중(빈 배열로 끄기 가능). 재업로드는 기존 선택 유지(update 경로).
      notices: frontmatter.notices ?? [BlogCommonTextType.AI_IMAGE_NOTICE],
      publishTarget:
        frontmatter.publish_target === BlogPublishTarget.DETAIL_PAGE
          ? BlogPublishTarget.DETAIL_PAGE
          : BlogPublishTarget.BLOG,
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

    // 발행된 글 수정 시 검색엔진 재색인 요청(GEO/AEO 최신화). 초안은 발행 시 핑.
    if (saved.status === BlogPostStatus.PUBLISHED) this.pingIndexNow(saved)

    return { id: saved.id, slug: saved.slug, status: saved.status, warnings }
  }

  /**
   * 의료진 이름 → blog.doctors ID. 글 언어(lang)의 의료진을 우선 매칭, 없으면 언어 무관 매칭.
   * 못 찾으면 경고 + undefined (발행 진행).
   */
  private async resolveDoctorId(
    name: string | undefined,
    lang: string,
    warnings: string[],
  ): Promise<string | undefined> {
    if (!name) return undefined
    const match = (langFilter: boolean) => {
      const qb = this.doctorRepo
        .createQueryBuilder("d")
        .where("(d.name = :name OR :name ILIKE d.name || ' %' OR d.name ILIKE :pattern)", {
          name,
          pattern: `${name.split(" ")[0]}%`,
        })
      if (langFilter) qb.andWhere("d.lang = :lang", { lang })
      return qb.getOne()
    }
    const doc = (await match(true)) ?? (await match(false))
    if (!doc) {
      warnings.push(`의료진 매칭 실패: "${name}" — 의료진 정보에 먼저 등록 필요`)
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

  /** 슬러그가 "이름 변경으로 사라진 옛 주소"(이력에 있음)인지 — SSR 410 처리용 */
  async isHistoricalSlug(slug: string, lang: string): Promise<boolean> {
    return (await this.historyRepo.count({ where: { oldSlug: slug, lang } })) > 0
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
    if (query.productCategoryId)
      // 대분류 자동 도출(B): 글의 대분류가 직접 일치하거나, product_page에 적힌 상세페이지가 그 대분류 소속이면 포함
      qb.andWhere(
        `(p.product_category_id = :pid OR EXISTS (
            SELECT 1 FROM public.product_detail_page dp
            WHERE dp.category_id = :pid
              AND EXISTS (SELECT 1 FROM unnest(string_to_array(p.product_page, ',')) AS e WHERE trim(e) = dp.name)
          ))`,
        { pid: query.productCategoryId },
      )
    if (query.keywordId) qb.andWhere("p.keyword_id = :kid", { kid: query.keywordId })
    if (query.publishTarget) qb.andWhere("p.publish_target = :ptgt", { ptgt: query.publishTarget })
    if (query.productPage)
      // product_page 는 콤마로 여러 상세페이지명을 가질 수 있음 → 각 항목(트림)과 정확 일치 검사
      qb.andWhere(
        "EXISTS (SELECT 1 FROM unnest(string_to_array(p.product_page, ',')) AS e WHERE trim(e) = :pp)",
        { pp: query.productPage },
      )
    if (query.productPageContains) {
      qb.andWhere("p.product_page ILIKE :ppc", { ppc: `%${query.productPageContains}%` })
    }
    if (query.q) {
      qb.andWhere("(p.title ILIKE :q OR p.summary_text ILIKE :q OR p.body_md ILIKE :q)", { q: `%${query.q}%` })
    }

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount()
    return { items, total, page, limit }
  }

  /**
   * 시술 상세페이지에 연결된 글 1건 (productPage 이름 + lang 일치, 발행·detail_page만).
   * 여러 개면 최신 발행/작성 글. 없으면 null → 프론트는 빈 공간 처리.
   */
  async findDetailPagePost(productPage: string, lang: string): Promise<BlogPostV2 | null> {
    if (!productPage || !lang) return null
    // product_page 에 콤마로 여러 상세페이지명이 들어갈 수 있으므로, 각 항목(트림)과 정확 일치 검사
    return this.postRepo
      .createQueryBuilder("p")
      .where("EXISTS (SELECT 1 FROM unnest(string_to_array(p.product_page, ',')) AS e WHERE trim(e) = :pp)", {
        pp: productPage,
      })
      .andWhere("p.lang = :lang", { lang })
      .andWhere("p.status = :status", { status: BlogPostStatus.PUBLISHED })
      .andWhere("p.publish_target = :ptgt", { ptgt: BlogPublishTarget.DETAIL_PAGE })
      .orderBy("p.published_at", "DESC")
      .addOrderBy("p.created_at", "DESC")
      .getOne()
  }

  /** 글에 적용할 공통 고지문구 type 목록 설정 (어드민 미리보기 체크박스). */
  async setNotices(id: string, notices: string[], user: User): Promise<BlogPostV2> {
    const post = await this.findOne(id)
    post.notices = notices
    post.updatedBy = user?.id
    return this.postRepo.save(post)
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

  /**
   * 발행 시 IndexNow 색인 즉시 통보 (네이버·Bing·Yandex). 공개 키는 site config에 하드코딩.
   * api.indexnow.org 로 보내면 네이버 등 파트너 검색엔진에 일괄 전파됨. (구글은 IndexNow 미지원 → sitemap 자동 수집)
   * 키 검증용 파일이 사이트 루트(/{key}.txt)에 호스팅돼 있어야 통보가 수락됨. 실패는 무시(발행 흐름 방해 금지).
   */
  private pingIndexNow(post: BlogPostV2): void {
    const key = PECHE_SITE.indexNowKey
    if (!key) return
    const url = `${PECHE_SITE.baseUrl}/${post.lang}/blog/${encodeURIComponent(post.slug)}`
    fetch(`https://api.indexnow.org/IndexNow?url=${encodeURIComponent(url)}&key=${key}`)
      .then((r) => this.logger.log(`IndexNow ping(${r.status}): ${url}`))
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
