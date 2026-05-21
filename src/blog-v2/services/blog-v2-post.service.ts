import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogPostV2 } from "@root/blog-v2/entities/post.entity"
import { BlogPostCitation } from "@root/blog-v2/entities/post-citation.entity"
import { BlogPostSlugHistory } from "@root/blog-v2/entities/post-slug-history.entity"
import { BlogSlugService } from "@root/blog-v2/services/slug.service"
import { BlogSummaryService } from "@root/blog-v2/services/summary.service"
import { BlogImageUploadService } from "@root/blog-v2/services/blog-image-upload.service"
import { BlogPostLang, BlogPostStatus } from "@root/blog-v2/enum/blog-v2.enum"
import { parseBlogMarkdown } from "@root/blog-v2/utils/markdown.util"
import { UploadBlogPostDto } from "@root/blog-v2/dto/upload-blog-post.dto"
import { QueryBlogPostDto } from "@root/blog-v2/dto/query-blog-post.dto"
import { User } from "@root/shared/interface/user"

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
    private readonly slugService: BlogSlugService,
    private readonly summaryService: BlogSummaryService,
    private readonly imageUpload: BlogImageUploadService,
  ) {}

  /**
   * multipart로 받은 .md + 이미지 파일들 → 이미지 S3 업로드 + URL 치환 → 초안 저장.
   */
  async uploadFromFiles(files: Express.Multer.File[], user: User): Promise<{ id: string; slug: string; status: string }> {
    const mdFile = files.find((f) => f.originalname.toLowerCase().endsWith(".md"))
    if (!mdFile) throw new BadRequestException(".md 파일이 multipart에 없음")

    const attachments = files.filter((f) => f !== mdFile)
    const rawMarkdown = mdFile.buffer.toString("utf-8")
    const markdown = await this.imageUpload.processImages(rawMarkdown, attachments)

    return this.upload({ markdown }, user)
  }

  /**
   * 마크다운 텍스트 → DB 초안 저장.
   * frontmatter 누락 필드는 자동 생성 hook으로 채움 (slug/summary).
   */
  async upload(dto: UploadBlogPostDto, user: User): Promise<{ id: string; slug: string; status: string }> {
    const { frontmatter, bodyMd } = parseBlogMarkdown(dto.markdown)

    if (!frontmatter.title) throw new BadRequestException("frontmatter.title 필수")
    if (!bodyMd) throw new BadRequestException("본문 비어있음")

    const lang = (frontmatter.lang as BlogPostLang) ?? BlogPostLang.KO
    const post = this.postRepo.create({
      title: frontmatter.title,
      subtitle: frontmatter.subtitle,
      bodyMd,
      thumbnailUrl: frontmatter.thumbnail,
      lang,
      status: BlogPostStatus.DRAFT,
      targetSite: "peche",
      mainKeyword: frontmatter.main_keyword,
      subKeywords: frontmatter.meta_keywords ?? frontmatter.sub_keywords,
      summaryText: frontmatter.summary ?? frontmatter.meta_description,
      slug: frontmatter.slug,
      keywordId: frontmatter.keyword_id,
      productCategoryId: frontmatter.product_category_id,
      authorDoctorId: frontmatter.author_doctor_id,
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

    return { id: saved.id, slug: saved.slug, status: saved.status }
  }

  async findOne(id: string): Promise<BlogPostV2> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ["keyword", "authorDoctor"],
    })
    if (!post) throw new NotFoundException(`blog post ${id} not found`)
    return post
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
    return this.postRepo.save(post)
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
