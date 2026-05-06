import { Injectable, Logger } from "@nestjs/common"
import { UploadService } from "@root/upload/upload.service"

const IMAGE_MD_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

@Injectable()
export class BlogImageUploadService {
  private readonly logger = new Logger(BlogImageUploadService.name)

  constructor(private readonly uploadService: UploadService) {}

  /**
   * 마크다운 안 상대경로 이미지를 같이 올라온 파일에서 찾아 S3 업로드하고 URL로 치환.
   * - 절대 URL(http/https/data:)은 건드리지 않음
   * - originalname 또는 basename 둘 다로 매칭 시도 (예: "images/foo.jpg" 또는 "foo.jpg")
   * - 매칭 실패한 경로는 경고 로그만 남기고 원본 유지
   */
  async processImages(markdown: string, attachments: Express.Multer.File[]): Promise<string> {
    if (attachments.length === 0) return markdown

    const fileMap = new Map<string, Express.Multer.File>()
    for (const f of attachments) {
      fileMap.set(f.originalname, f)
      const basename = f.originalname.split("/").pop()
      if (basename) fileMap.set(basename, f)
    }

    const matches = [...markdown.matchAll(IMAGE_MD_REGEX)]
    const replacements = new Map<string, string>()

    for (const m of matches) {
      const path = m[2]
      if (/^https?:\/\//i.test(path) || /^data:/i.test(path)) continue
      if (replacements.has(path)) continue

      const file = fileMap.get(path) ?? fileMap.get(path.split("/").pop() ?? "")
      if (!file) {
        this.logger.warn(`이미지 매칭 실패: ${path}`)
        continue
      }

      try {
        const { url } = await this.uploadService.uploadImage(file)
        replacements.set(path, url)
      } catch (err) {
        this.logger.error(`S3 업로드 실패 (${path}): ${(err as Error).message}`)
      }
    }

    let result = markdown
    for (const [oldPath, newUrl] of replacements) {
      result = result.replace(
        new RegExp(`(!\\[[^\\]]*\\]\\()${escapeRegex(oldPath)}(\\))`, "g"),
        `$1${newUrl}$2`,
      )
    }
    return result
  }
}
