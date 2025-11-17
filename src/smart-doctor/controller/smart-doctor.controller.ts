import { Controller, Get } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { SmartDoctorRepository } from "@root/smart-doctor/repository/smart-doctor.repository"

@Controller("smart-doctor")
@ApiTags("smart-doctor")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
export class SmartDoctorController {
  constructor(private readonly repository: SmartDoctorRepository) {}

  @Get("nationalities")
  async findNationalities() {
    return this.repository.requestNationalities()
  }
}
