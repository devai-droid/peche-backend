import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common"
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { FileUrlReq, PreSignedUrl } from "@root/file/dto/file-object.dto"
import { FileService } from "@root/file/service/files.service"
import { Auth, AuthUser } from "../../shared/decorator/auth-user.decorator"
import { User } from "../../shared/interface/user"
import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY, SWAGGER_TOKEN_NAME } from "@root/shared/constant/auth"
import { Role } from "@root/shared/enum/auth"

@Controller("files")
@ApiTags("files")
@Auth(AuthGuard(JWT_STRATEGY), SWAGGER_TOKEN_NAME, Role.USER)
export class FileController {
  constructor(private readonly service: FileService) {}

  @Post("upload-urls")
  @ApiResponse({ type: [PreSignedUrl] })
  @ApiOperation({ summary: "파일 업로드를 위한 AWS S3 pre-signed url을 반환" })
  async createPreSignedUrl(@Body() dto: FileUrlReq, @AuthUser() user: User) {
    return await this.service.getPreSignedUrls(dto, user)
  }

  @Get(":id")
  @ApiOperation({ summary: "fileObject 조회" })
  async findOneFileObject(@Param("id") id: string) {
    return await this.service.findOne(id)
  }

  @Delete(":id")
  @ApiOperation({ summary: "fileObject 및 S3 파일 제거" })
  async removeFileObject(@Param("id") id: string, @AuthUser() user: User) {
    return await this.service.deleteUserFile(id, user)
  }
}
