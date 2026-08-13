import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common"
import { FilesInterceptor } from "@nestjs/platform-express"
import { UploadExceptionFilter } from "@root/blog-v2/filters/multer-exception.filter"
import { AuthGuard } from "@nestjs/passport"
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { BlogV2PostService } from "@root/blog-v2/services/blog-v2-post.service"
import { UploadBlogPostDto } from "@root/blog-v2/dto/upload-blog-post.dto"
import { QueryBlogPostDto } from "@root/blog-v2/dto/query-blog-post.dto"
import { UpdatePostNoticesDto } from "@root/blog-v2/dto/common-text.dto"
import { BlogPostStatus, BlogPublishTarget } from "@root/blog-v2/enum/blog-v2.enum"

const MAX_FILES = 50
const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB (업로드 후 이미지 최적화로 웹용 축소)

@Controller("blog-v2/posts")
@ApiTags("blog-v2/posts")
export class BlogV2PostController {
  constructor(private readonly service: BlogV2PostService) {}

  @ApiOperation({
    summary: "폴더 업로드 (.md + images/ 서브폴더 한 번에)",
    description: "폴더 안 .md 1개 + 이미지 N개를 multipart로 업로드. 백엔드가 이미지 S3 업로드 + 마크다운 URL 치환 + 초안 저장.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { files: { type: "array", items: { type: "string", format: "binary" } } } } })
  @Post()
  @UseFilters(UploadExceptionFilter)
  @UseInterceptors(FilesInterceptor("files", MAX_FILES, { limits: { fileSize: MAX_FILE_SIZE } }))
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async uploadFolder(@UploadedFiles() files: Express.Multer.File[], @AuthUser() user: User) {
    return this.service.uploadFromFiles(files, user)
  }

  @ApiOperation({ summary: "마크다운 텍스트만 업로드 (이미지 없을 때)" })
  @Post("text")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async uploadText(@Body() dto: UploadBlogPostDto, @AuthUser() user: User) {
    return this.service.upload(dto, user)
  }

  @ApiOperation({
    summary:
      "상세페이지 원고 폴더 업로드 — 상품 설명(상세페이지)에 붙일 md+이미지. detail_page로 자동 등록·발행, 같은 상품이면 덮어쓰기.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { files: { type: "array", items: { type: "string", format: "binary" } } } } })
  @Post("detail-page")
  @UseFilters(UploadExceptionFilter)
  @UseInterceptors(FilesInterceptor("files", MAX_FILES, { limits: { fileSize: MAX_FILE_SIZE } }))
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async uploadDetailPage(
    @UploadedFiles() files: Express.Multer.File[],
    @Query("productPage") productPage: string,
    @Query("lang") lang: string,
    @AuthUser() user: User,
  ) {
    return this.service.uploadDetailPageFromFiles(files, user, productPage, lang || "ko")
  }

  @ApiOperation({
    summary: "기존 글 재업로드(수정) — 목록에서 글 선택 후 새 폴더로 덮어쓰기",
    description: "그 글을 새 .md + 이미지로 갱신. 최초 등록일·작성일 유지, 수정일만 갱신, 발행 상태 유지.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { files: { type: "array", items: { type: "string", format: "binary" } } } } })
  @Post(":id/reupload")
  @UseFilters(UploadExceptionFilter)
  @UseInterceptors(FilesInterceptor("files", MAX_FILES, { limits: { fileSize: MAX_FILE_SIZE } }))
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async reupload(
    @Param("id", ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @AuthUser() user: User,
  ) {
    return this.service.updateFromFiles(id, files, user)
  }

  @ApiOperation({ summary: "공개 글 목록 (인증 불필요, 발행 글만) — frontend 블로그 목록용. detail_page 글은 제외" })
  @Get("public/list")
  async publicList(@Query() query: QueryBlogPostDto) {
    return this.service.findMany({
      ...query,
      status: BlogPostStatus.PUBLISHED,
      publishTarget: BlogPublishTarget.BLOG,
    })
  }

  @ApiOperation({
    summary: "공개: 시술 상세페이지에 연결된 글 (productPage+lang, 발행·detail_page만) — 상세페이지 영상 아래 노출용",
  })
  @Get("public/detail-page")
  async publicDetailPagePost(@Query("productPage") productPage: string, @Query("lang") lang: string) {
    return this.service.findDetailPagePost(productPage, lang)
  }

  @ApiOperation({ summary: "내부링크 치환용 — slug들 중 발행된 글의 slug→제목 맵" })
  @Get("public/slug-titles")
  async publicSlugTitles(@Query("lang") lang: string, @Query("slugs") slugs: string) {
    const list = (slugs ?? "").split(",").map((s) => s.trim()).filter(Boolean)
    return this.service.getPublishedTitlesBySlugs(list, lang || "ko")
  }


  @ApiOperation({
    summary: "공개 가격 보기 데이터 (postId+lang) — 프론트 가격 섹션용. 봇 SSR과 동일 로직(price_refs page/category/event)",
  })
  @Get("public/prices/:id")
  async publicPrices(@Param("id", ParseUUIDPipe) id: string, @Query("lang") lang: string) {
    const post = await this.service.findOne(id)
    return this.service.getBlogPriceData(post.priceRefs, post.productPage, lang || post.lang)
  }

  @ApiOperation({ summary: "공개 글 상세 (slug, 인증 불필요) — frontend 블로그 상세용" })
  @Get("public/detail/:lang/:slug")
  async publicDetail(@Param("lang") lang: string, @Param("slug") slug: string) {
    const post = await this.service.findBySlug(slug, lang)
    if (!post || post.status !== BlogPostStatus.PUBLISHED) {
      throw new NotFoundException(`발행된 글을 찾을 수 없습니다: ${slug}`)
    }
    return post
  }

  @ApiOperation({
    summary: "미리보기 (id, 인증 불필요, 초안 포함) — 어드민 미리보기 iframe 전용. 페이지는 noindex 처리됨",
  })
  @Get("public/preview/:id")
  async publicPreview(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOne(id)
  }

  @ApiOperation({ summary: "블로그 글 목록 (어드민용)" })
  @Get()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async findMany(@Query() query: QueryBlogPostDto) {
    return this.service.findMany(query)
  }

  @ApiOperation({ summary: "블로그 글 상세 (어드민 미리보기용)" })
  @Get(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOne(id)
  }

  @ApiOperation({ summary: "글 적용 고지문구 설정 (미리보기 체크박스)" })
  @Post(":id/notices")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async setNotices(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostNoticesDto,
    @AuthUser() user: User,
  ) {
    return this.service.setNotices(id, dto.notices ?? [], user)
  }

  @ApiOperation({ summary: "블로그 글 삭제" })
  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.remove(id)
  }

  @ApiOperation({ summary: "발행 (status=published, publishedAt=now)" })
  @Post(":id/publish")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async publish(@Param("id", ParseUUIDPipe) id: string, @AuthUser() user: User) {
    return this.service.publish(id, user)
  }

  @ApiOperation({ summary: "발행 취소 (status=draft)" })
  @Post(":id/unpublish")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async unpublish(@Param("id", ParseUUIDPipe) id: string, @AuthUser() user: User) {
    return this.service.unpublish(id, user)
  }
}
