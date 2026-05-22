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
  UseInterceptors,
} from "@nestjs/common"
import { FilesInterceptor } from "@nestjs/platform-express"
import { AuthGuard } from "@nestjs/passport"
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { BlogV2PostService } from "@root/blog-v2/services/blog-v2-post.service"
import { UploadBlogPostDto } from "@root/blog-v2/dto/upload-blog-post.dto"
import { QueryBlogPostDto } from "@root/blog-v2/dto/query-blog-post.dto"
import { BlogPostStatus } from "@root/blog-v2/enum/blog-v2.enum"

const MAX_FILES = 50
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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

  @ApiOperation({ summary: "공개 글 목록 (인증 불필요, 발행 글만) — frontend 블로그 목록용" })
  @Get("public/list")
  async publicList(@Query() query: QueryBlogPostDto) {
    return this.service.findMany({ ...query, status: BlogPostStatus.PUBLISHED })
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
