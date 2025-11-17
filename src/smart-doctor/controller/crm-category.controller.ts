import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { CrmCategoryService } from "@root/smart-doctor/service/crm-category.service"
import { AuthGuard } from "@nestjs/passport"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { CrmCategory } from "@root/smart-doctor/entities/crm-category.entity"
import { UpdateCrmCategoryDto } from "@root/smart-doctor/dto/crm-category.dto"
import { User } from "@root/shared/interface/user"

@Controller("crm-categories")
@ApiTags("crm-categories")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class CrmCategoryController {
  constructor(private readonly crmCategoryService: CrmCategoryService) {}

  @ApiOkResponse({ type: CrmCategory, isArray: true })
  @Get("")
  async findMany() {
    return this.crmCategoryService.findMany()
  }

  @ApiOkResponse({ type: CrmCategory, isArray: true })
  @Post("")
  async refreshCrmCategories() {
    return this.crmCategoryService.refreshCrmCategories()
  }

  @ApiOkResponse({ type: CrmCategory })
  @Put(":code")
  async updateCrmCategory(@Param("code") code: string, @Body() dto: UpdateCrmCategoryDto, @AuthUser() user: User) {
    return this.crmCategoryService.update(code, dto, user)
  }

  @Delete(":code")
  async removeCrmCategory(@Param("code") code: string) {
    return this.crmCategoryService.remove(code)
  }
}
