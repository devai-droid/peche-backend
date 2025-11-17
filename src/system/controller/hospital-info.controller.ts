import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { Auth, AuthUser } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"
import { CreateHospitalInfoDto, HospitalInfoList, UpdateHospitalInfoDto } from "@root/system/dto/hospital-info.dto"
import { HospitalInfoService } from "@root/system/service/hospital-info.service"
import { HospitalInfo } from "@root/system/entities/hospital-info.entity"

@Controller("hospital-infos")
@ApiTags("hospital-infos")
export class HospitalInfoController {
  constructor(private readonly hospitalInfoService: HospitalInfoService) {}

  @ApiOkResponse({ type: HospitalInfoList })
  @Get("")
  async findMany() {
    return this.hospitalInfoService.findAll()
  }

  @ApiOkResponse({ type: HospitalInfo })
  @Post("")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async create(@Body() dto: CreateHospitalInfoDto) {
    return this.hospitalInfoService.create(dto)
  }

  @ApiOkResponse({ type: HospitalInfo })
  @Put(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateHospitalInfoDto, @AuthUser() user?: User) {
    return this.hospitalInfoService.update(id, dto, user)
  }

  @Delete(":id")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.hospitalInfoService.remove(id)
  }
}
