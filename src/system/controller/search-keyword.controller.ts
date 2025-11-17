import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { CreateSearchKeywordDto, SearchKeywordList, UpdateSearchKeywordDto } from "@root/system/dto/search-keyword.dto"
import { SearchKeywordService } from "@root/system/service/search-keyword.service"
import { SearchKeywordQueryDto } from "@root/system/dto/search-keyword-query.dto"
import { SearchKeyword } from "@root/system/entities/search-keyword.entity"

@Controller("search-keywords")
@ApiTags("search-keywords")
export class SearchKeywordController {
  constructor(private readonly searchKeywordService: SearchKeywordService) {}

  @ApiOkResponse({ type: SearchKeywordList })
  @Get("")
  async findMany(@Query() query: SearchKeywordQueryDto) {
    return this.searchKeywordService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: SearchKeyword })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateSearchKeywordDto) {
    return this.searchKeywordService.create(dto)
  }

  @ApiOkResponse({ type: SearchKeyword })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateSearchKeywordDto, @AuthUser() user?: User) {
    return this.searchKeywordService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.searchKeywordService.remove(id)
  }
}
