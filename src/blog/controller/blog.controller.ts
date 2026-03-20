import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common"
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { BlogService } from "@root/blog/service/blog.service"
import { CreateBlogPostDto } from "@root/blog/dto/create-blog-post.dto"
import { UpdateBlogPostDto } from "@root/blog/dto/update-blog-post.dto"
import { CreateBlogCategoryDto } from "@root/blog/dto/create-blog-category.dto"
import { QueryBlogDto } from "@root/blog/dto/query-blog.dto"
import { User } from "@root/shared/interface/user"

@Controller("blog")
@ApiTags("blog")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiOperation({ summary: "블로그 목록 조회 (페이지네이션)" })
  @Get("")
  async findMany(@Query() query: QueryBlogDto) {
    return this.blogService.findMany(query)
  }

  @ApiOperation({ summary: "블로그 카테고리 목록 조회" })
  @Get("categories")
  async findAllCategories() {
    return this.blogService.findAllCategories()
  }

  @ApiOperation({ summary: "블로그 카테고리 생성" })
  @Post("categories")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async createCategory(@Body() dto: CreateBlogCategoryDto) {
    return this.blogService.createCategory(dto)
  }

  @ApiOperation({ summary: "블로그 카테고리 수정" })
  @Patch("categories/:id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async updateCategory(@Param("id", ParseUUIDPipe) id: string, @Body() dto: CreateBlogCategoryDto) {
    return this.blogService.updateCategory(id, dto)
  }

  @ApiOperation({ summary: "블로그 상세 조회 (slug)" })
  @Get(":slug")
  async findBySlug(@Param("slug") slug: string) {
    return this.blogService.findBySlug(slug)
  }

  @ApiOperation({ summary: "블로그 글 생성" })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateBlogPostDto, @AuthUser() user: User) {
    return this.blogService.create(dto, user)
  }

  @ApiOperation({ summary: "블로그 글 수정" })
  @Patch(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto)
  }

  @ApiOperation({ summary: "블로그 글 삭제" })
  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.blogService.remove(id)
  }
}
