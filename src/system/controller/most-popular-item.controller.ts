import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"

import { MostPopularItemService } from "../service/most-popular-item.service"
import { CreateMostPopularItemDto, UpdateMostPopularItemDto } from "../dto/most-popular-item.dto"
import { MostPopularItem } from "../entities/most-popular-item.entity"

@Controller("most-popular-items")
@ApiTags("most-popular-items")
export class MostPopularItemController {
  constructor(private readonly itemService: MostPopularItemService) {}

  @ApiOkResponse({ type: [MostPopularItem] })
  @Get("")
  async findAll() {
    return this.itemService.findAll() // ← repo 직접 접근하지 않음
  }

  @ApiOkResponse({ type: MostPopularItem })
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.itemService.findOne(id)
  }

  @ApiOkResponse({ type: MostPopularItem })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateMostPopularItemDto) {
    return this.itemService.create(dto)
  }

  @ApiOkResponse({ type: MostPopularItem })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateMostPopularItemDto, @AuthUser() user?: User) {
    return this.itemService.update(id, dto)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.itemService.remove(id)
  }
}
