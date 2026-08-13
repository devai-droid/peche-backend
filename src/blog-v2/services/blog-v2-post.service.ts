import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { In, Repository } from "typeorm"
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
import { kstDayBounds } from "@root/shared/helper/kst.helper"

/** 블로그 가격 섹션 한 행 (상시/이벤트 공통) */
export interface BlogPriceRow {
  name: string
  description: string | null
  price: number
  discountPrice: number | null
  // 이벤트 전용
  labels?: string[] | null
  categoryName?: string | null
}
/**
 * 가격 묶음(탭 1개) — products(전체 시술)·events(가격이벤트, 게시중만). linkType으로 더보기 링크·내부 구성 결정.
 *  - page: 상세페이지 → products+events 모두(내부 가격이벤트/전체시술 탭)
 *  - category: 상품 대분류 → products만(내부 탭 없음)
 *  - event: 이벤트 대분류 → events만(내부 탭 없음)
 */
export interface BlogPriceGroup {
  linkType: "page" | "category" | "event"
  linkId: string // 더보기 대상 id: page=상세페이지, category=상품대분류, event=이벤트대분류
  detailPageName: string // 탭 라벨 (상세페이지명/대분류명/이벤트대분류명)
  products: BlogPriceRow[]
  events: BlogPriceRow[]
}

/** 가격 보기 소스 참조 (blog.posts.price_refs 저장 형태) */
export interface BlogPriceRef {
  type: "page" | "category" | "event"
  id: string
  name: string
}

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
    if (!mdFile) throw new BadRequestException(".md 파일이 없습니다. 글 원고(.md)를 포함해 올려주세요.")

    const attachments = files.filter((f) => f !== mdFile)
    const rawMarkdown = mdFile.buffer.toString("utf-8")
    const urlMap = await this.imageUpload.uploadAttachments(attachments)
    const bodyReplaced = this.imageUpload.replacePaths(rawMarkdown, urlMap)

    return this.createFromMarkdown(bodyReplaced, user, urlMap)
  }

  /**
   * 상세페이지 원고 업로드 — 상품 설명 모달의 폴더 업로드용.
   * blog-v2 엔진 재사용: detail_page 대상 + 자동 발행. 같은 상품(product_page)의 상세글이 있으면 재업로드(덮어쓰기), 없으면 새로 등록.
   * publish_target을 md에 안 적어도 서버가 detail_page로 지정한다.
   */
  async uploadDetailPageFromFiles(
    files: Express.Multer.File[],
    user: User,
    productPage: string,
    lang: string,
  ): Promise<{ id: string; slug: string; status: string; warnings: string[] }> {
    if (!productPage) throw new BadRequestException("상품(상세페이지)을 찾을 수 없습니다.")
    const mdFile = files.find((f) => f.originalname.toLowerCase().endsWith(".md"))
    if (!mdFile) throw new BadRequestException(".md 파일이 없습니다. 원고(.md)를 포함해 올려주세요.")

    const attachments = files.filter((f) => f !== mdFile)
    const rawMarkdown = mdFile.buffer.toString("utf-8")
    const urlMap = await this.imageUpload.uploadAttachments(attachments)
    const bodyReplaced = this.imageUpload.replacePaths(rawMarkdown, urlMap)

    const existing = await this.findDetailPagePost(productPage, lang)
    if (existing) {
      return this.updateFromMarkdown(existing.id, bodyReplaced, user, urlMap, {
        detailPage: true,
        langOverride: lang,
      })
    }
    return this.createFromMarkdown(bodyReplaced, user, urlMap, {
      detailPage: true,
      publish: true,
      langOverride: lang,
    })
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
    if (!mdFile) throw new BadRequestException(".md 파일이 없습니다. 글 원고(.md)를 포함해 올려주세요.")

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
    opts: { detailPage?: boolean; langOverride?: string } = {},
  ): Promise<{ id: string; slug: string; status: string; warnings: string[] }> {
    const post = await this.findOne(id)
    // 프론트매터(상단 설정) YAML이 깨지면 파서가 throw → 무의미한 500 대신 명확한 안내
    const parsed = (() => {
      try {
        return parseBlogMarkdown(markdown)
      } catch (e) {
        throw new BadRequestException(
          `글 형식(상단 설정)을 읽지 못했습니다 — 프론트매터 형식을 확인해주세요. (${(e as Error).message})`,
        )
      }
    })()
    const { frontmatter, bodyMd } = parsed
    const warnings: string[] = []

    if (!frontmatter.title || !bodyMd) {
      throw new BadRequestException("md 파일에 오류가 있습니다. 제목·본문·형식을 확인해주세요.")
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

    // 재업로드로는 주소(slug)를 바꿀 수 없다. 원고 주소가 이 글과 다르면 (대개 엉뚱한 글에 올린 것) 막고 안내.
    // 상세페이지는 slug가 공개 URL이 아니라(=/products/:id) 검사 제외. 블로그 글만 주소 변경 차단.
    const newSlug = frontmatter.slug || post.slug
    if (!opts.detailPage && newSlug !== post.slug) {
      throw new BadRequestException("원고의 주소(slug)가 이 글과 다릅니다.")
    }

    post.title = frontmatter.title
    post.subtitle = frontmatter.subtitle
    post.bodyMd = bodyMd
    post.bodyHtml = renderMarkdownToHtml(bodyMd)
    if (thumbnailUrl) post.thumbnailUrl = thumbnailUrl
    post.lang = (opts.langOverride as BlogPostLang) ?? (frontmatter.lang as BlogPostLang) ?? post.lang
    post.topicKeyword = frontmatter.topic_keyword ?? frontmatter.keyword
    post.mainKeyword = frontmatter.title_keyword ?? frontmatter.main_keyword
    post.subKeywords =
      frontmatter.content_keywords ?? frontmatter.meta_keywords ?? frontmatter.sub_keywords
    post.summaryText = summaryText ?? post.summaryText
    post.slug = newSlug
    post.keywordId = keywordId
    post.productCategoryId = productCategoryId
    post.authorDoctorId = authorDoctorId
    post.reviewerDoctorIds = await this.resolveReviewerDoctorIds(
      frontmatter.reviewer_doctors,
      (frontmatter.lang as string) || "ko",
      warnings,
    )
    post.schemaType = frontmatter.schema_type
    post.extraJsonld = extraJsonld ?? undefined
    post.internalLinks = Array.isArray(frontmatter.internal_links)
      ? frontmatter.internal_links.map((l) => ({ anchor: l.anchor, slug: l.slug }))
      : undefined
    post.productPage = Array.isArray(frontmatter.product_page)
      ? frontmatter.product_page.join(" | ")
      : frontmatter.product_page
    // CTA는 md가 source of truth — 재업로드 시 md 기준으로 갱신(product_page와 동일 정책). 없으면 해제.
    post.ctaLinks = await this.resolveCtaLinks(frontmatter.cta, warnings)
    // 가격 보기 소스도 md가 source of truth — price 있으면 그대로, 없으면 product_page로 폴백.
    post.priceRefs = await this.resolvePriceRefs(frontmatter.price, post.productPage, warnings)
    // 스키마 about(핵심 시술) — md가 source of truth.
    post.medicalAbout = this.parseMedicalAbout(frontmatter.about)
    post.publishTarget =
      opts.detailPage || frontmatter.publish_target === BlogPublishTarget.DETAIL_PAGE
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
    opts: { detailPage?: boolean; publish?: boolean; langOverride?: string } = {},
  ): Promise<{ id: string; slug: string; status: string; warnings: string[] }> {
    // 프론트매터(상단 설정) YAML이 깨지면 파서가 throw → 무의미한 500 대신 명확한 안내
    const parsed = (() => {
      try {
        return parseBlogMarkdown(markdown)
      } catch (e) {
        throw new BadRequestException(
          `글 형식(상단 설정)을 읽지 못했습니다 — 프론트매터 형식을 확인해주세요. (${(e as Error).message})`,
        )
      }
    })()
    const { frontmatter, bodyMd } = parsed
    const warnings: string[] = []

    if (!frontmatter.title || !bodyMd) {
      throw new BadRequestException("md 파일에 오류가 있습니다. 제목·본문·형식을 확인해주세요.")
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

    // 상세페이지는 lang을 상품설명 모달의 언어 탭에서 받음(langOverride) → md에 lang 불필요
    const lang = (opts.langOverride as BlogPostLang) ?? (frontmatter.lang as BlogPostLang) ?? BlogPostLang.KO
    const post = this.postRepo.create({
      title: frontmatter.title,
      subtitle: frontmatter.subtitle,
      bodyMd,
      bodyHtml: renderMarkdownToHtml(bodyMd),
      thumbnailUrl,
      lang,
      status: opts.publish ? BlogPostStatus.PUBLISHED : BlogPostStatus.DRAFT,
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
      reviewerDoctorIds: await this.resolveReviewerDoctorIds(
        frontmatter.reviewer_doctors,
        (frontmatter.lang as string) || "ko",
        warnings,
      ),
      schemaType: frontmatter.schema_type,
      extraJsonld: extraJsonld ?? undefined,
      internalLinks: Array.isArray(frontmatter.internal_links)
        ? frontmatter.internal_links.map((l) => ({ anchor: l.anchor, slug: l.slug }))
        : undefined,
      productPage: Array.isArray(frontmatter.product_page)
        ? frontmatter.product_page.join(" | ")
        : frontmatter.product_page,
      ctaLinks: await this.resolveCtaLinks(frontmatter.cta, warnings),
      priceRefs: await this.resolvePriceRefs(
        frontmatter.price,
        Array.isArray(frontmatter.product_page)
          ? frontmatter.product_page.join(" | ")
          : frontmatter.product_page,
        warnings,
      ),
      medicalAbout: this.parseMedicalAbout(frontmatter.about),
      // 고지문구: 일반 면책은 항상 적용(프론트에서 자동), AI 이미지 고지는 신규 글에 기본 등록.
      // frontmatter로 명시하면 그 값을 존중(빈 배열로 끄기 가능). 재업로드는 기존 선택 유지(update 경로).
      notices: frontmatter.notices ?? [BlogCommonTextType.AI_IMAGE_NOTICE],
      publishTarget:
        opts.detailPage || frontmatter.publish_target === BlogPublishTarget.DETAIL_PAGE
          ? BlogPublishTarget.DETAIL_PAGE
          : BlogPublishTarget.BLOG,
      publishedAt: frontmatter.published_at
        ? new Date(frontmatter.published_at)
        : opts.publish
          ? new Date()
          : undefined,
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

  /** frontmatter.reviewer_doctors(감수 의료진 이름 목록) → 의료진 id 목록. 매칭 실패는 경고 후 제외. */
  private async resolveReviewerDoctorIds(
    names: string[] | undefined,
    lang: string,
    warnings: string[],
  ): Promise<string[] | undefined> {
    if (!Array.isArray(names) || names.length === 0) return undefined
    const ids: string[] = []
    for (const nm of names) {
      const id = await this.resolveDoctorId((nm ?? "").trim() || undefined, lang, warnings)
      if (id && !ids.includes(id)) ids.push(id)
    }
    return ids.length ? ids : undefined
  }

  /** 감수 의료진 조회(스키마 reviewedBy용). 입력 id 순서 유지. */
  async getReviewerDoctors(ids: string[] | undefined): Promise<BlogDoctor[]> {
    if (!Array.isArray(ids) || ids.length === 0) return []
    const docs = await this.doctorRepo.find({ where: { id: In(ids) } })
    return ids.map((id) => docs.find((d) => d.id === id)).filter((d): d is BlogDoctor => !!d)
  }

  /**
   * frontmatter.about → 저장 형태 정규화. **자유 키-값 그대로 통과**(코드가 속성을 고정하지 않음).
   * name만 필수(식별·병합용), name 없는 항목은 제외. 빈 값 키는 버린다.
   */
  private parseMedicalAbout(
    about: Array<Record<string, unknown>> | undefined,
  ): Array<Record<string, unknown>> | undefined {
    if (!Array.isArray(about)) return undefined
    const out: Array<Record<string, unknown>> = []
    for (const a of about) {
      if (!a || typeof a !== "object") continue
      const name = String((a as Record<string, unknown>).name ?? "").trim()
      if (!name) continue
      const node: Record<string, unknown> = { name }
      for (const [k, v] of Object.entries(a)) {
        if (k === "name" || v === undefined || v === null) continue
        if (typeof v === "string") {
          const s = v.trim()
          if (s) node[k] = s
        } else {
          node[k] = v
        }
      }
      out.push(node)
    }
    return out.length ? out : undefined
  }

  /**
   * 스키마 속성 마스터 조회 — 대분류·상세페이지 이름으로 blog.schema_attributes에서 속성을 찾는다.
   * 반환: { category: { 이름 → 속성 }, detailPage: { 이름 → 속성 } }. 실패해도 렌더는 정상(빈 맵).
   */
  async getSchemaAttributes(
    categoryNames: string[],
    detailPageNames: string[],
    clinicName?: string,
  ): Promise<{
    category: Record<string, Record<string, unknown>>
    detailPage: Record<string, Record<string, unknown>>
    clinic: Record<string, unknown> | null
  }> {
    const empty = { category: {}, detailPage: {}, clinic: null }
    const names = [...categoryNames, ...detailPageNames, clinicName ?? ""].map((s) => (s ?? "").trim()).filter(Boolean)
    if (!names.length) return empty
    try {
      const rows: Array<{ target_type: string; name: string; attributes: Record<string, unknown> | null }> =
        await this.postRepo.query(
          `SELECT target_type, name, attributes FROM blog.schema_attributes WHERE name = ANY($1)`,
          [Array.from(new Set(names))],
        )
      const out = { category: {}, detailPage: {}, clinic: null } as {
        category: Record<string, Record<string, unknown>>
        detailPage: Record<string, Record<string, unknown>>
        clinic: Record<string, unknown> | null
      }
      for (const r of rows) {
        if (!r.attributes) continue
        if (r.target_type === "category") out.category[r.name] = r.attributes
        else if (r.target_type === "detail_page") out.detailPage[r.name] = r.attributes
        else if (r.target_type === "clinic" && r.name === clinicName) out.clinic = r.attributes
      }
      return out
    } catch (e) {
      this.logger.warn(`getSchemaAttributes 실패: ${(e as Error).message}`)
      return empty
    }
  }

  /** product_page 상세페이지명 → { id, name } 목록 (스키마 about 개별 시술 url용). 읽기 전용, 실패 시 []. */
  async getProductPageProcedures(productPage: string | undefined): Promise<Array<{ id: string; name: string }>> {
    try {
      const sep = (productPage ?? "").includes("|") ? "|" : ","
      const names = (productPage ?? "").split(sep).map((s) => s.trim()).filter(Boolean)
      if (!names.length) return []
      const out: Array<{ id: string; name: string }> = []
      const seen = new Set<string>()
      for (const nm of names) {
        const rows: Array<{ id: string; name: string }> = await this.postRepo.query(
          `SELECT id, name FROM public.product_detail_page WHERE name = $1 AND status = 'ACTIVE' LIMIT 1`,
          [nm],
        )
        if (rows.length && !seen.has(rows[0].id)) {
          seen.add(rows[0].id)
          out.push({ id: rows[0].id, name: rows[0].name })
        }
      }
      return out
    } catch (e) {
      this.logger.warn(`getProductPageProcedures 실패: ${(e as Error).message}`)
      return []
    }
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

  /**
   * 내부링크 치환용 — 주어진 slug들 중 "발행된" 글의 slug→제목 맵.
   * 미발행/미존재 slug는 결과에 없음(호출측에서 링크 대신 텍스트 처리).
   */
  async getPublishedTitlesBySlugs(slugs: string[], lang: string): Promise<Record<string, string>> {
    const uniq = Array.from(new Set((slugs ?? []).map((s) => (s ?? "").trim()).filter(Boolean)))
    if (!uniq.length) return {}
    try {
      const rows: Array<{ slug: string; title: string }> = await this.postRepo.query(
        `SELECT slug, title FROM blog.posts WHERE lang = $1 AND status = 'published' AND slug = ANY($2)`,
        [lang, uniq],
      )
      const map: Record<string, string> = {}
      for (const r of rows) map[r.slug] = r.title
      return map
    } catch (e) {
      // 조회 실패해도 글 렌더는 정상 — 내부링크는 텍스트로 폴백
      this.logger.warn(`getPublishedTitlesBySlugs 실패: ${(e as Error).message}`)
      return {}
    }
  }

  /**
   * 글 빵부스러기(Breadcrumb)용 — 대분류 + 상세페이지.
   * product_page 첫 상세페이지 → 그 상세페이지 + 소속 대분류. 없으면 productCategoryId로 대분류만.
   */
  async getPostBreadcrumb(
    productCategoryId: string | undefined,
    productPage: string | undefined,
  ): Promise<{ category: { id: string; name: string } | null; detailPage: { id: string; name: string } | null }> {
    let category: { id: string; name: string } | null = null
    let detailPage: { id: string; name: string } | null = null
    try {
      const sep = (productPage ?? "").includes("|") ? "|" : ","
      const first = (productPage ?? "").split(sep).map((s) => s.trim()).filter(Boolean)[0]
      if (first) {
        const rows: Array<{ dpid: string; dpname: string; cid: string; cname: string }> =
          await this.postRepo.query(
            `SELECT dp.id AS dpid, dp.name AS dpname, pc.id AS cid, pc.name AS cname
             FROM public.product_detail_page dp
             JOIN public.product_category pc ON pc.id = dp.category_id
             WHERE dp.name = $1 AND dp.status = 'ACTIVE' AND pc.status = 'ACTIVE' LIMIT 1`,
            [first],
          )
        if (rows.length) {
          detailPage = { id: rows[0].dpid, name: rows[0].dpname }
          category = { id: rows[0].cid, name: rows[0].cname }
        }
      }
      if (!category && productCategoryId) {
        const rows: Array<{ id: string; name: string }> = await this.postRepo.query(
          `SELECT id, name FROM public.product_category WHERE id = $1 AND status = 'ACTIVE' LIMIT 1`,
          [productCategoryId],
        )
        if (rows.length) category = rows[0]
      }
    } catch (e) {
      this.logger.warn(`getPostBreadcrumb 실패: ${(e as Error).message}`)
    }
    return { category, detailPage }
  }

  /**
   * frontmatter.cta(최대 2개) → 이름 매칭으로 URL 해석해 저장.
   * 항목별로 page/category/event 중 하나 + text. 매칭 실패 항목은 경고 후 제외.
   * page: 상세페이지 → /products/{id}, category: 상시 대분류 → /products?category={id}, event: 이벤트 대분류 → /events?category={id}
   */
  private async resolveCtaLinks(
    cta: Array<{ page?: string; category?: string; event?: string; text?: string }> | undefined,
    warnings: string[],
  ): Promise<BlogPostV2["ctaLinks"]> {
    if (!Array.isArray(cta) || cta.length === 0) return undefined
    if (cta.length > 2) warnings.push(`CTA는 최대 2개까지만 적용됩니다 — 앞의 2개만 사용(${cta.length}개 입력됨)`)
    const out: NonNullable<BlogPostV2["ctaLinks"]> = []
    for (const item of cta.slice(0, 2)) {
      const type: "page" | "category" | "event" | undefined = item.page
        ? "page"
        : item.category
          ? "category"
          : item.event
            ? "event"
            : undefined
      const target = (item.page ?? item.category ?? item.event ?? "").trim()
      if (!type || !target) {
        warnings.push("CTA 항목에 page/category/event 중 하나가 필요합니다 — 해당 항목 제외")
        continue
      }
      const url = await this.resolveCtaUrl(type, target, warnings)
      if (!url) continue
      out.push({ type, target, text: (item.text ?? target).trim(), url })
    }
    return out.length ? out : undefined
  }

  private async resolveCtaUrl(
    type: "page" | "category" | "event",
    target: string,
    warnings: string[],
  ): Promise<string | undefined> {
    const table = type === "page" ? "product_detail_page" : type === "category" ? "product_category" : "event_category"
    const rows: Array<{ id: string }> = await this.postRepo.query(
      `SELECT id FROM public.${table} WHERE name = $1 AND status = 'ACTIVE' LIMIT 1`,
      [target],
    )
    if (!rows.length) {
      const label = type === "page" ? "상세페이지" : type === "category" ? "상시 대분류" : "이벤트 대분류"
      warnings.push(`CTA ${label} 매칭 실패: "${target}" — 사이트 실제 이름과 정확히 일치해야 함`)
      return undefined
    }
    if (type === "page") return `/products/${rows[0].id}`
    if (type === "category") return `/products?category=${rows[0].id}`
    return `/events?category=${rows[0].id}`
  }

  /**
   * frontmatter.price(가격 보기 소스) → 이름을 id로 해석해 저장.
   * 항목별로 page(상세페이지) 또는 category(대분류) 하나. 매칭 실패 항목은 경고 후 제외(있는 것만 노출).
   * price가 없으면 product_page(상세페이지명, '|'/',' 구분)로 폴백 → 각 이름을 page 참조로.
   */
  private async resolvePriceRefs(
    price: Array<{ page?: string; category?: string; event?: string }> | undefined,
    productPage: string | undefined,
    warnings: string[],
  ): Promise<BlogPriceRef[] | undefined> {
    // 1) price 명시 → 그대로 해석
    if (Array.isArray(price) && price.length > 0) {
      const meta: Record<"page" | "category" | "event", { table: string; label: string }> = {
        page: { table: "product_detail_page", label: "상세페이지" },
        category: { table: "product_category", label: "상품 대분류" },
        event: { table: "event_category", label: "이벤트 대분류" },
      }
      const out: BlogPriceRef[] = []
      for (const item of price) {
        const type: "page" | "category" | "event" | undefined = item.page
          ? "page"
          : item.category
            ? "category"
            : item.event
              ? "event"
              : undefined
        const name = (item.page ?? item.category ?? item.event ?? "").trim()
        if (!type || !name) {
          warnings.push("price 항목에 page/category/event 중 하나가 필요합니다 — 해당 항목 제외")
          continue
        }
        const rows: Array<{ id: string; name: string }> = await this.postRepo.query(
          `SELECT id, name FROM public.${meta[type].table} WHERE name = $1 AND status = 'ACTIVE' LIMIT 1`,
          [name],
        )
        if (!rows.length) {
          warnings.push(`price ${meta[type].label} 매칭 실패: "${name}" — 사이트 실제 이름과 정확히 일치해야 함`)
          continue
        }
        out.push({ type, id: rows[0].id, name: rows[0].name })
      }
      return out.length ? out : undefined
    }
    // 2) 폴백: product_page 상세페이지명 → page 참조 (기존 글 하위호환)
    const sep = (productPage ?? "").includes("|") ? "|" : ","
    const names = (productPage ?? "").split(sep).map((s) => s.trim()).filter(Boolean)
    if (!names.length) return undefined
    const out: BlogPriceRef[] = []
    for (const nm of names) {
      const rows: Array<{ id: string; name: string }> = await this.postRepo.query(
        `SELECT id, name FROM public.product_detail_page WHERE name = $1 AND status = 'ACTIVE' LIMIT 1`,
        [nm],
      )
      if (rows.length) out.push({ type: "page", id: rows[0].id, name: rows[0].name })
    }
    return out.length ? out : undefined
  }

  /** 언어 → 상품/이벤트 테이블의 이름·설명·노출·정렬 컬럼(snake) 매핑 */
  private static priceCols(lang: string): { n: string; d: string; v: string; o: string } {
    const map: Record<string, { n: string; d: string; v: string; o: string }> = {
      ko: { n: "name", d: "description", v: "visible", o: "order" },
      en: { n: "name_en", d: "description_en", v: "visible_en", o: "order_en" },
      zh: { n: "name_zh", d: "description_zh", v: "visible_zh", o: "order_zh" },
      "zh-TW": { n: "name_zhtw", d: "description_zhtw", v: "visible_zhtw", o: "order_zhtw" },
      ja: { n: "name_ja", d: "description_ja", v: "visible_ja", o: "order_ja" },
      th: { n: "name_th", d: "description_th", v: "visible_th", o: "order_th" },
    }
    return map[lang] ?? map.ko
  }

  /**
   * 블로그 가격 섹션 데이터 — product_page(콤마로 여러 상세페이지명)별로 상시 상품 + 게시중 이벤트를 조회.
   * 상세페이지별로 구분(섞지 않음). 정렬은 사이트와 동일(order). 이벤트는 게시기간(bundle) 노출중 + detail_page_show만.
   * 언어별 이름·노출·정렬 컬럼 사용(이름은 번역 없으면 ko로 폴백). 봇 SSR·API 공용.
   */
  async getBlogPriceData(
    refs: BlogPriceRef[] | undefined,
    productPage: string | undefined,
    lang: string,
  ): Promise<BlogPriceGroup[]> {
    try {
      return await this.getBlogPriceDataInner(refs, productPage, lang)
    } catch (e) {
      // 가격 조회 실패해도 글 렌더(봇 SSR 포함)는 정상 진행 — 가격 섹션만 빠짐
      this.logger.warn(`getBlogPriceData 실패: ${(e as Error).message}`)
      return []
    }
  }

  private async getBlogPriceDataInner(
    refs: BlogPriceRef[] | undefined,
    productPage: string | undefined,
    lang: string,
  ): Promise<BlogPriceGroup[]> {
    // price_refs 우선. 없으면(기존 글) product_page 상세페이지명 → page 참조로 폴백.
    let effective: BlogPriceRef[] = Array.isArray(refs) ? refs : []
    if (!effective.length) {
      const sep = (productPage ?? "").includes("|") ? "|" : ","
      const names = (productPage ?? "").split(sep).map((s) => s.trim()).filter(Boolean)
      for (const nm of names) {
        const dpRows: Array<{ id: string; name: string }> = await this.postRepo.query(
          `SELECT id, name FROM public.product_detail_page WHERE name = $1 AND status = 'ACTIVE' LIMIT 1`,
          [nm],
        )
        if (dpRows.length) effective.push({ type: "page", id: dpRows[0].id, name: dpRows[0].name })
      }
    }
    if (!effective.length) return []
    const c = BlogV2PostService.priceCols(lang)
    const { todayStart, tomorrowStart } = kstDayBounds()
    // 상세페이지 id 목록의 상시 상품 — 입력 id 순서(=상세페이지 order) → 상품 order
    const productsByDetail = (ids: string[]): Promise<BlogPriceRow[]> =>
      this.postRepo.query(
        `SELECT COALESCE(${c.n}, name) AS name,
                COALESCE(${c.d}, description) AS description,
                price, discount_price AS "discountPrice"
         FROM public.product
         WHERE detail_page_id = ANY($1::uuid[]) AND ${c.v} IS TRUE
         ORDER BY array_position($1::uuid[], detail_page_id), "${c.o}" ASC NULLS LAST`,
        [ids],
      )
    // 상세페이지 id 목록의 게시중 이벤트(detail_page_show) — 상세페이지 order → 번들 order → 이벤트 order
    const eventsByDetail = (ids: string[]): Promise<BlogPriceRow[]> =>
      this.postRepo.query(
        `SELECT COALESCE(e.${c.n}, e.name) AS name,
                COALESCE(e.${c.d}, e.description) AS description,
                e.price, e.discount_price AS "discountPrice",
                e.label::text[] AS labels,
                COALESCE(ec.${c.n}, ec.name) AS "categoryName"
         FROM public.event e
         LEFT JOIN public.event_bundle b ON b.id = e.bundle_id
         LEFT JOIN public.event_category ec ON ec.id = e.category_id
         WHERE e.detail_page_id = ANY($1::uuid[])
           AND e.${c.v} IS TRUE
           AND e.detail_page_show IS TRUE
           AND (b.post_start_date IS NULL OR b.post_start_date < $2)
           AND (b.post_end_date IS NULL OR b.post_end_date >= $3)
         ORDER BY array_position($1::uuid[], e.detail_page_id), b."order" ASC NULLS LAST, e."${c.o}" ASC NULLS LAST`,
        [ids, tomorrowStart, todayStart],
      )

    const groups: BlogPriceGroup[] = []
    for (const ref of effective) {
      let products: BlogPriceRow[] = []
      let events: BlogPriceRow[] = []
      if (ref.type === "event") {
        // 이벤트 대분류 → 그 대분류의 게시중 이벤트만(상품 없음, 내부 탭 없음)
        events = await this.postRepo.query(
          `SELECT COALESCE(e.${c.n}, e.name) AS name,
                  COALESCE(e.${c.d}, e.description) AS description,
                  e.price, e.discount_price AS "discountPrice",
                  e.label::text[] AS labels,
                  COALESCE(ec.${c.n}, ec.name) AS "categoryName"
           FROM public.event e
           LEFT JOIN public.event_bundle b ON b.id = e.bundle_id
           LEFT JOIN public.event_category ec ON ec.id = e.category_id
           WHERE e.category_id = $1
             AND e.${c.v} IS TRUE
             AND (b.post_start_date IS NULL OR b.post_start_date < $2)
             AND (b.post_end_date IS NULL OR b.post_end_date >= $3)
           ORDER BY b."order" ASC NULLS LAST, e."${c.o}" ASC NULLS LAST`,
          [ref.id, tomorrowStart, todayStart],
        )
      } else if (ref.type === "category") {
        // 상품 대분류 → 소속 상세페이지 전체를 order 순으로 훑어 게시중 이벤트 수집(첫 상세페이지가 비어도 다음 것 노출).
        // 이벤트가 하나도 없으면 같은 순서로 상시 상품 폴백.
        const dps: Array<{ id: string }> = await this.postRepo.query(
          `SELECT id FROM public.product_detail_page
           WHERE category_id = $1 AND status = 'ACTIVE'
           ORDER BY "order" ASC NULLS LAST`,
          [ref.id],
        )
        if (!dps.length) continue
        const ids = dps.map((r) => r.id)
        events = await eventsByDetail(ids)
        if (!events.length) products = await productsByDetail(ids)
      } else {
        // page → 자기 상세페이지 상시 상품 + 게시중 이벤트(내부 탭)
        products = await productsByDetail([ref.id])
        events = await eventsByDetail([ref.id])
      }
      // 둘 다 비면 탭 자체를 생략
      if (products.length || events.length)
        groups.push({ linkType: ref.type, linkId: ref.id, detailPageName: ref.name, products, events })
    }
    return groups
  }

  async findOne(id: string): Promise<BlogPostV2> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ["keyword", "authorDoctor"],
    })
    if (!post) throw new NotFoundException("글을 찾을 수 없습니다. 목록을 새로고침해 주세요.")
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
              AND EXISTS (SELECT 1 FROM unnest(string_to_array(p.product_page, CASE WHEN position('|' in p.product_page) > 0 THEN '|' ELSE ',' END)) AS e WHERE trim(e) = dp.name)
          ))`,
        { pid: query.productCategoryId },
      )
    if (query.keywordId) qb.andWhere("p.keyword_id = :kid", { kid: query.keywordId })
    if (query.publishTarget) qb.andWhere("p.publish_target = :ptgt", { ptgt: query.publishTarget })
    if (query.productPage)
      // product_page 는 콤마로 여러 상세페이지명을 가질 수 있음 → 각 항목(트림)과 정확 일치 검사
      qb.andWhere(
        "EXISTS (SELECT 1 FROM unnest(string_to_array(p.product_page, CASE WHEN position('|' in p.product_page) > 0 THEN '|' ELSE ',' END)) AS e WHERE trim(e) = :pp)",
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
    // 1) 정확 일치 — 모든 대분류 공통(product_page에 여러 이름을 |/, 로 나열 가능)
    const exact = await this.queryDetailPost([productPage], lang)
    if (exact) return exact
    // 2) 제모 대분류 한정 폴백 — 같은 대분류 + 같은 장비면 공통 콘텐츠 노출(다른 대분류는 폴백 안 함)
    const peers = await this.hairRemovalSharedNames(productPage)
    if (!peers.length) return null
    return this.queryDetailPost(peers, lang)
  }

  /** product_page 목록 중 하나라도 일치하는 발행 detail_page 글 */
  private queryDetailPost(names: string[], lang: string): Promise<BlogPostV2 | null> {
    if (!names.length) return Promise.resolve(null)
    return this.postRepo
      .createQueryBuilder("p")
      .where(
        "EXISTS (SELECT 1 FROM unnest(string_to_array(p.product_page, CASE WHEN position('|' in p.product_page) > 0 THEN '|' ELSE ',' END)) AS e WHERE trim(e) IN (:...names))",
        { names },
      )
      .andWhere("p.lang = :lang", { lang })
      .andWhere("p.status = :status", { status: BlogPostStatus.PUBLISHED })
      .andWhere("p.publish_target = :ptgt", { ptgt: BlogPublishTarget.DETAIL_PAGE })
      .orderBy("p.published_at", "DESC")
      .addOrderBy("p.created_at", "DESC")
      .getOne()
  }

  /**
   * 제모 대분류 한정: 이 상품과 같은 대분류 + 같은 장비(이름의 부위 괄호 뒤 텍스트)인 상세페이지명 목록.
   * 제모 대분류가 아니면 빈 배열 → 폴백 안 함(다른 대분류는 정확 일치만).
   */
  private async hairRemovalSharedNames(productPage: string): Promise<string[]> {
    const rows: Array<{ name: string; cat: string }> = await this.postRepo.query(
      `SELECT dp.name, pc.name AS cat
       FROM public.product_detail_page dp
       JOIN public.product_category pc ON pc.id = dp.category_id
       WHERE dp.category_id = (SELECT category_id FROM public.product_detail_page WHERE name = $1 AND status = 'ACTIVE' LIMIT 1)
         AND dp.status = 'ACTIVE'`,
      [productPage],
    )
    if (!rows.length || !/제모/.test(rows[0].cat)) return [] // 제모 대분류만
    const deviceOf = (n: string) => (n.split(")").pop() ?? "").trim()
    const device = deviceOf(productPage)
    if (!device) return []
    return rows.map((r) => r.name).filter((n) => deviceOf(n) === device)
  }

  /**
   * 상세페이지 콘텐츠의 대표(canonical) 상품 id.
   * 현재 상품이 원본(글의 product_page)에 속하면 자기 자신, 아니면(제모 공통 사본) 원본 상품을 가리킨다.
   */
  async resolveDetailCanonicalProductId(currentName: string, post: BlogPostV2): Promise<string | null> {
    const raw = post.productPage ?? ""
    const sep = raw.includes("|") ? "|" : ","
    const sourceNames = raw
      .split(sep)
      .map((s) => s.trim())
      .filter(Boolean)
    const targetName = sourceNames.includes(currentName) ? currentName : sourceNames[0]
    if (!targetName) return null
    const rows: Array<{ id: string }> = await this.postRepo.query(
      `SELECT id FROM public.product_detail_page WHERE name = $1 AND status = 'ACTIVE' LIMIT 1`,
      [targetName],
    )
    return rows.length ? rows[0].id : null
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
    if (result.affected === 0) throw new NotFoundException("글을 찾을 수 없습니다. 목록을 새로고침해 주세요.")
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
