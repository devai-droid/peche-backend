import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogPostV2 } from "@root/blog-v2/entities/post.entity"
import { BlogPostSlugHistory } from "@root/blog-v2/entities/post-slug-history.entity"
import { AnthropicService } from "@root/blog-v2/services/anthropic.service"
import { normalizeSlug } from "@root/blog-v2/utils/slug.util"

const MAX_LLM_RETRY = 1
const MAX_FALLBACK_SUFFIX = 50

interface GenerateSlugInput {
  title: string
  content?: string
  lang: string
  productCategoryId?: string
  excludePostId?: string
  keyword?: string
}

@Injectable()
export class BlogSlugService {
  private readonly logger = new Logger(BlogSlugService.name)

  constructor(
    @InjectRepository(BlogPostV2) private readonly postRepo: Repository<BlogPostV2>,
    @InjectRepository(BlogPostSlugHistory) private readonly historyRepo: Repository<BlogPostSlugHistory>,
    private readonly anthropic: AnthropicService,
  ) {}

  /** 같은 lang 내에서 slug가 이미 사용 중인지 (posts + history 둘 다 체크) */
  async slugExists(slug: string, lang: string, excludePostId?: string): Promise<boolean> {
    const postQb = this.postRepo
      .createQueryBuilder("p")
      .where("p.slug = :slug AND p.lang = :lang", { slug, lang })
    if (excludePostId) postQb.andWhere("p.id != :excludePostId", { excludePostId })
    const post = await postQb.getOne()
    if (post) return true

    const history = await this.historyRepo.findOne({ where: { oldSlug: slug, lang } })
    return !!history
  }

  /** 같은 product_category_id의 기존 slug 일부 (LLM 차별화 힌트용) */
  private async findSimilarSlugs(productCategoryId: string | undefined, lang: string, excludePostId?: string): Promise<string[]> {
    if (!productCategoryId) return []
    const qb = this.postRepo
      .createQueryBuilder("p")
      .select("p.slug")
      .where("p.product_category_id = :pid AND p.lang = :lang", { pid: productCategoryId, lang })
      .limit(20)
    if (excludePostId) qb.andWhere("p.id != :excludePostId", { excludePostId })
    const rows = await qb.getMany()
    return rows.map((r) => r.slug).filter(Boolean)
  }

  private buildPrompt(title: string, contentPreview: string, existingSlugs: string[], keyword?: string): string {
    const existingList =
      existingSlugs.length > 0
        ? `\n\n[참고] 같은 시술 영역의 기존 slug 목록:\n${existingSlugs.map((s) => `- ${s}`).join("\n")}\n위 slug들과 겹치지 않는 차별화된 키워드를 사용해.`
        : ""
    const keywordRule = keyword
      ? `\n- **대표 키워드 "${keyword}"를 slug에 반드시 포함** (1순위, 가능하면 맨 앞)`
      : ""
    const keywordLine = keyword ? `\n대표 키워드(1순위 필수 포함): ${keyword}` : ""

    return `다음 의료 블로그 포스팅의 SEO 최적화 URL slug를 생성해줘.

규칙 (엄격히 준수):${keywordRule}
- 한글 + 하이픈(-) 조합만 사용 (영문 고유명사/시술명/제품명은 허용)
- 2~4개 핵심 키워드만, 총 30자 이내
- 조사·어미·불용어 제거 (예: ~의, ~을, ~에 대한, ~까요, ~인가요 등)
- 핵심 의료 용어·시술명·증상명 우선 (예: 보톡스, 필러, 쥬브아셀, 스킨부스터)
- 질문형 어미·감탄사·의문부호 제거
- 출력: slug 한 줄만. 다른 설명/인사/따옴표 없이.${existingList}

제목: ${title}${keywordLine}
본문 요약: ${contentPreview.substring(0, 300)}`
  }

  private ensureKeywordIncluded(slug: string, keyword?: string): string {
    if (!keyword) return slug
    const normalizedKeyword = normalizeSlug(keyword)
    if (!normalizedKeyword) return slug
    if (slug.includes(normalizedKeyword)) return slug
    return normalizeSlug(`${normalizedKeyword}-${slug}`)
  }

  private buildFallbackSlug(title: string, keyword?: string): string {
    const firstWords = title.split(/\s+/).filter(Boolean).slice(0, 3).join(" ")
    const base = normalizeSlug(firstWords)
    return this.ensureKeywordIncluded(base, keyword)
  }

  /**
   * 메인 진입점: unique slug 생성.
   * 흐름: 유사 slug 조회 → LLM 생성(1회 재시도) → 키워드 강제 → 중복 시 -2/-3/...-50 fallback → 최후 timestamp.
   */
  async generateUniqueSlug(input: GenerateSlugInput): Promise<string> {
    const { title, content = "", lang, productCategoryId, excludePostId, keyword } = input
    if (!title) throw new Error("[slug] title 비어있음")

    const existingSlugs = await this.findSimilarSlugs(productCategoryId, lang, excludePostId)

    let slug: string | null = null
    if (this.anthropic.hasApiKey()) {
      try {
        for (let attempt = 0; attempt <= MAX_LLM_RETRY; attempt++) {
          const hint = attempt === 0 ? existingSlugs : [...existingSlugs, slug ?? ""]
          const raw = await this.anthropic.complete(this.buildPrompt(title, content, hint, keyword), {
            maxTokens: 60,
          })
          const candidate = this.ensureKeywordIncluded(normalizeSlug(raw), keyword)
          if (!candidate) continue
          if (!(await this.slugExists(candidate, lang, excludePostId))) {
            slug = candidate
            break
          }
          slug = candidate
        }
      } catch (err) {
        this.logger.warn(`LLM slug 생성 실패, fallback 사용: ${(err as Error).message}`)
      }
    }

    if (!slug) {
      slug = this.buildFallbackSlug(title, keyword) || `post-${Date.now()}`
      this.logger.warn(`fallback slug 사용: "${slug}" (title="${title}")`)
    }

    let finalSlug = slug
    let counter = 2
    while (await this.slugExists(finalSlug, lang, excludePostId)) {
      if (counter > MAX_FALLBACK_SUFFIX) {
        finalSlug = `${slug}-${Date.now()}`
        break
      }
      finalSlug = `${slug}-${counter}`
      counter++
    }
    return finalSlug
  }
}
