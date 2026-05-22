import { Injectable, Logger } from "@nestjs/common"
import * as fs from "fs"
import * as path from "path"
import sharp = require("sharp")
import { UploadService } from "@root/upload/upload.service"

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads", "blog")
const LOCAL_BASE_URL = "http://localhost:3007"

const MAX_IMAGE_WIDTH = 1600 // 웹 표시용 최대 폭
const WEBP_QUALITY = 80
const OPTIMIZABLE = /^image\/(png|jpe?g|webp)$/i // svg·gif(애니메이션)는 변환 제외

// ![alt](path) — path가 <...>로 감싸진 경우(공백 포함 경로)도 매칭
const IMAGE_MD_REGEX = /!\[([^\]]*)\]\(\s*<?([^)>]+)>?\s*\)/g
const SYSTEM_FILES = /(^|\/)(Thumbs\.db|\.DS_Store|desktop\.ini)$/i

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// multer/busboy가 multipart 파일명을 latin1로 디코딩 → UTF-8 한글 깨짐(mojibake). 재디코딩 복구.
function fixFilename(n: string): string {
  return Buffer.from(n, "latin1").toString("utf8").normalize("NFC")
}

// 경로 prefix 제거 + NFC 통일 (macOS NFD vs 마크다운 NFC)
function normalizeKey(p: string): string {
  return p.replace(/^\.?\//, "").trim().normalize("NFC")
}

@Injectable()
export class BlogImageUploadService {
  private readonly logger = new Logger(BlogImageUploadService.name)

  constructor(private readonly uploadService: UploadService) {}

  /**
   * 첨부 이미지 전부 S3 업로드 → 다양한 키(originalname / basename / 정규화 경로)로 URL 맵 반환.
   * 시스템 파일(Thumbs.db·.DS_Store 등)은 제외.
   */
  async uploadAttachments(attachments: Express.Multer.File[]): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>()
    const uploaded = new Map<string, string>() // originalname → url (중복 업로드 방지)

    for (const f of attachments) {
      const name = fixFilename(f.originalname)
      if (SYSTEM_FILES.test(name)) continue
      try {
        let url = uploaded.get(name)
        if (!url) {
          url = await this.uploadOne(f, name)
          uploaded.set(name, url)
        }
        const basename = name.split("/").pop() ?? name
        urlMap.set(name, url)
        urlMap.set(normalizeKey(name), url)
        urlMap.set(basename, url)
      } catch (err) {
        this.logger.error(`이미지 업로드 실패 (${name}): ${(err as Error).message}`)
      }
    }
    return urlMap
  }

  /** S3 업로드. 업로드 전 이미지 최적화(리사이즈+WebP). 로컬 환경 S3 실패 시 디스크 fallback. */
  private async uploadOne(f: Express.Multer.File, name: string): Promise<string> {
    const opt = await this.optimizeImage(f)
    try {
      return (await this.uploadService.uploadImage(opt)).url
    } catch (err) {
      if (process.env.IS_LOCAL_ENV === "1") {
        this.logger.warn(`S3 실패 → 로컬 저장 fallback (${name})`)
        return this.saveLocal(opt)
      }
      throw err
    }
  }

  /**
   * 이미지 최적화: 최대 폭 리사이즈 + WebP 변환(용량 대폭 절감·로딩 향상).
   * 변환 대상 아님(svg/gif 등)이거나 실패 시 원본 그대로 반환.
   */
  private async optimizeImage(f: Express.Multer.File): Promise<Express.Multer.File> {
    if (!OPTIMIZABLE.test(f.mimetype)) return f
    try {
      const buffer = await sharp(f.buffer)
        .rotate() // EXIF 회전 반영
        .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()
      const originalname = `${f.originalname.replace(/\.[^.]+$/, "")}.webp`
      return { ...f, buffer, mimetype: "image/webp", originalname, size: buffer.length }
    } catch (err) {
      this.logger.warn(`이미지 최적화 실패 → 원본 사용 (${f.originalname}): ${(err as Error).message}`)
      return f
    }
  }

  private saveLocal(f: Express.Multer.File, name = f.originalname): string {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true })
    const basename = name.split("/").pop() ?? name
    const safe = `${Date.now()}-${basename}`
    fs.writeFileSync(path.join(LOCAL_UPLOAD_DIR, safe), f.buffer)
    return `${LOCAL_BASE_URL}/uploads/blog/${encodeURIComponent(safe)}`
  }

  /** 단일 경로(frontmatter thumbnail 등)를 업로드된 URL로 해결. 못 찾으면 원본 반환. */
  resolveSingle(path: string | undefined, urlMap: Map<string, string>): string | undefined {
    if (!path) return undefined
    if (/^https?:\/\//i.test(path)) return path
    const key = normalizeKey(path)
    return urlMap.get(path) ?? urlMap.get(key) ?? urlMap.get(key.split("/").pop() ?? "") ?? path
  }

  /** 본문 마크다운 이미지 경로를 S3 URL로 치환 (<> 형식 포함). 절대 URL은 유지. */
  replacePaths(markdown: string, urlMap: Map<string, string>): string {
    const matches = [...markdown.matchAll(IMAGE_MD_REGEX)]
    let result = markdown

    for (const m of matches) {
      const rawPath = m[2].trim()
      if (/^https?:\/\//i.test(rawPath) || /^data:/i.test(rawPath)) continue

      const key = normalizeKey(rawPath)
      const base = key.split("/").pop() ?? ""
      const url = urlMap.get(rawPath) ?? urlMap.get(key) ?? urlMap.get(base)
      if (!url) {
        this.logger.warn(`이미지 매칭 실패: key="${key}" base="${base}" | 보유키: ${[...urlMap.keys()].join(" || ")}`)
        continue
      }
      // 원본 전체 마크다운 토큰(m[0])에서 경로만 교체 — <> 유무 모두 안전하게
      const replaced = m[0].replace(rawPath, url).replace(/<|>/g, (c) => (c === "<" || c === ">" ? "" : c))
      result = result.replace(m[0], replaced)
    }
    return result
  }

  /**
   * 하위호환: 본문만 처리하던 기존 시그니처 유지.
   */
  async processImages(markdown: string, attachments: Express.Multer.File[]): Promise<string> {
    if (attachments.length === 0) return markdown
    const urlMap = await this.uploadAttachments(attachments)
    return this.replacePaths(markdown, urlMap)
  }
}
