import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import { Auth } from "@root/shared/decorator/auth-user.decorator"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"
import { UploadService } from "./upload.service"

@Controller("upload")
@ApiTags("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: "이미지 업로드 (S3)" })
  @Post("image")
  @Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.ADMIN)
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadImage(file)
  }
}
