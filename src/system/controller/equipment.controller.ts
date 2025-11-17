import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { CreateEquipmentDto, EquipmentList, UpdateEquipmentDto } from "@root/system/dto/equipment.dto"
import { EquipmentService } from "@root/system/service/equipment.service"
import { EquipmentQueryDto } from "@root/system/dto/equipment-query.dto"
import { Equipment } from "@root/system/entities/equipment.entity"

@Controller("equipments")
@ApiTags("equipments")
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @ApiOkResponse({ type: EquipmentList })
  @Get("")
  async findMany(@Query() query: EquipmentQueryDto) {
    return this.equipmentService.findManyWithPaginationQuery(query)
  }

  @ApiOkResponse({ type: Equipment })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto)
  }

  @ApiOkResponse({ type: Equipment })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateEquipmentDto, @AuthUser() user?: User) {
    return this.equipmentService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.equipmentService.remove(id)
  }
}
