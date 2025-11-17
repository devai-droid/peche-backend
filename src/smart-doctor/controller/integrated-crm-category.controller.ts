import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common"
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { AuthGuard } from "@nestjs/passport"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { IntegratedCrmCategoryService } from "@root/smart-doctor/service/integrated-crm-category.service"
import {
  CreateIntegratedCrmCategoryDto,
  UpdateIntegratedCrmCategoryDto,
} from "@root/smart-doctor/dto/integrated-crm-category.dto"
import { IntegratedCrmCategory } from "@root/smart-doctor/entities/integrated-crm-category.entity"

@Controller("integrated-crm-categories")
@ApiTags("integrated-crm-categories")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class IntegratedCrmCategoryController {
  constructor(private readonly integratedCrmCategoryService: IntegratedCrmCategoryService) {}

  @ApiOkResponse({ type: IntegratedCrmCategory, isArray: true })
  @Get()
  async findMany() {
    return this.integratedCrmCategoryService.findMany()
  }

  @ApiBody({ type: CreateIntegratedCrmCategoryDto, isArray: true })
  @ApiOkResponse({ type: IntegratedCrmCategory, isArray: true })
  @Post()
  async bulkCreate(@Body() dtos: CreateIntegratedCrmCategoryDto[]) {
    return this.integratedCrmCategoryService.bulkCreate(dtos)
  }

  @ApiBody({ type: UpdateIntegratedCrmCategoryDto, isArray: true })
  @ApiOkResponse({ type: IntegratedCrmCategory, isArray: true })
  @Put()
  async bulkUpdate(@Body() dtos: UpdateIntegratedCrmCategoryDto[], @AuthUser() user: User) {
    return this.integratedCrmCategoryService.bulkUpdate(dtos, user)
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.integratedCrmCategoryService.remove(id)
  }
}
