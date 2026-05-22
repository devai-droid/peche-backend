import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { AwsHelper } from "@root/shared/helper/aws.helper"
import { STATIC_CONFIG } from "@root/shared/constant/static-config"
import { Env } from "@root/shared/enum/env"

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client

  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client(AwsHelper.config)
  }

  /**
   * 이미지 1개를 운영 미디어 버킷(MEDIA_BUCKET_NAME)에 업로드하고 CloudFront 공개 URL을 반환.
   * (S3 직접 URL은 비공개라 403 → 반드시 CloudFront(MEDIA_BASE_URL) 경유)
   */
  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    const filename = `${Date.now()}-${file.originalname}`
    const key = `blog/thumbnails/${filename}`

    const bucket = this.config.get<string>(Env.MEDIA_BUCKET_NAME)
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    )

    // 한글·공백 파일명 대비 파일명만 percent-encoding (경로 구분자는 유지)
    const url = `${STATIC_CONFIG.MEDIA_BASE_URL}/blog/thumbnails/${encodeURIComponent(filename)}`
    return { url }
  }
}
