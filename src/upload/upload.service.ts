import { Injectable } from "@nestjs/common"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { AwsHelper } from "@root/shared/helper/aws.helper"
import { STATIC_CONFIG } from "@root/shared/constant/static-config"

const UPLOAD_BUCKET = "peche-assets"

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client

  constructor() {
    this.s3Client = new S3Client(AwsHelper.config)
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    const timestamp = Date.now()
    const key = `blog/thumbnails/${timestamp}-${file.originalname}`

    const command = new PutObjectCommand({
      Bucket: UPLOAD_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })

    await this.s3Client.send(command)

    const region = STATIC_CONFIG.AWS_DEFAULT_REGION
    const url = `https://${UPLOAD_BUCKET}.s3.${region}.amazonaws.com/${key}`

    return { url }
  }
}
