import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common"
import { ApiBody, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger"
import { AuthGuard } from "@nestjs/passport"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { LanguageLocale, Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { LangCrmCategoryService } from "@root/smart-doctor/service/lang-crm-category.service"
import { CreateLangCrmCategoryDto, UpdateLangCrmCategoryDto } from "@root/smart-doctor/dto/lang-crm-category.dto"
import { LangCrmCategory } from "@root/smart-doctor/entities/lang-crm-category.entity"
import { LangCategoryStatus } from "@root/shared/enum/category"

@Controller("lang-crm-categories")
@ApiTags("lang-crm-categories")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class LangCrmCategoryController {
  constructor(private readonly langCrmCategoryService: LangCrmCategoryService) {}

  @ApiOkResponse({ type: LangCrmCategory, isArray: true })
  @Get()
  async findMany() {
    return this.langCrmCategoryService.findMany()
  }

  @ApiOkResponse({ type: LangCrmCategory, isArray: true })
  @ApiQuery({ name: "lang", enum: LanguageLocale, required: false })
  @Get("by-lang")
  async findByLang(@Query("lang") lang: LanguageLocale) {
    return this.langCrmCategoryService.findByLang(lang)
  }

  @ApiOkResponse({ type: LangCrmCategory, isArray: true })
  @ApiQuery({ name: "status", enum: LangCategoryStatus, required: false })
  @Get("by-status")
  async findByStatus(@Query("status") status: LangCategoryStatus) {
    return this.langCrmCategoryService.findByStatus(status)
  }

  @ApiBody({ type: CreateLangCrmCategoryDto, isArray: true })
  @ApiOkResponse({ type: LangCrmCategory, isArray: true })
  @Post()
  async bulkCreate(@Body() dtos: CreateLangCrmCategoryDto[]) {
    return this.langCrmCategoryService.bulkCreate(dtos)
  }

  @ApiBody({ type: UpdateLangCrmCategoryDto, isArray: true })
  @ApiOkResponse({ type: LangCrmCategory, isArray: true })
  @Put()
  async bulkUpdate(@Body() dtos: UpdateLangCrmCategoryDto[], @AuthUser() user: User) {
    return this.langCrmCategoryService.bulkUpdate(dtos, user)
  }

  @ApiOkResponse({ type: LangCrmCategory })
  @Put(":id/toggle-status")
  async toggleStatus(@Param("id") id: string, @AuthUser() user: User) {
    return this.langCrmCategoryService.toggleStatus(id, user)
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.langCrmCategoryService.remove(id)
  }
}
