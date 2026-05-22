import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { BlogDoctorService } from "@root/blog-v2/services/blog-doctor.service"
import { CreateBlogDoctorDto, QueryBlogDoctorDto, UpdateBlogDoctorDto } from "@root/blog-v2/dto/doctor.dto"

@Controller("blog-v2/doctors")
@ApiTags("blog-v2/doctors")
export class BlogDoctorController {
  constructor(private readonly service: BlogDoctorService) {}

  @ApiOperation({ summary: "감수의사 등록 (마스터)" })
  @Post()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  create(@Body() dto: CreateBlogDoctorDto, @AuthUser() user: User) {
    return this.service.create(dto, user)
  }

  @ApiOperation({ summary: "감수의사 목록" })
  @Get()
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  findMany(@Query() query: QueryBlogDoctorDto) {
    return this.service.findMany(query)
  }

  @ApiOperation({ summary: "감수의사 상세" })
  @Get(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOne(id)
  }

  @ApiOperation({ summary: "감수의사 수정" })
  @Patch(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateBlogDoctorDto, @AuthUser() user: User) {
    return this.service.update(id, dto, user)
  }

  @ApiOperation({ summary: "감수의사 삭제" })
  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.service.remove(id)
  }
}
