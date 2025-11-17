import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class FileUrlReq {
  @ApiProperty({ description: "생성할 pre-signed url의 개수" })
  count: number
  @ApiPropertyOptional({
    type: String,
    default: "files",
    description: "https://{media-cloudfront-host}/{directory}/{fileId}형태로 파일을 서비스하게 됨",
  })
  directory = "files"
}

export class UserFileUrlReq extends FileUrlReq {
  @ApiProperty({ description: "생성할 pre-signed url의 개수" })
  count: number
  @ApiPropertyOptional({
    type: String,
    default: "users",
    description: "https://{media-cloudfront-host}/{directory}/{fileId}형태로 파일을 서비스하게 됨",
  })
  directory = "users"
}

export class PreSignedUrl {
  @ApiProperty()
  id: string
  @ApiProperty()
  url: string
}
