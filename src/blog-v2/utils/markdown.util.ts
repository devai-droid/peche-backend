import * as matter from "gray-matter"
import * as cheerio from "cheerio"
import MarkdownIt = require("markdown-it")

const md = new MarkdownIt({ html: true, linkify: true, breaks: false })

/**
 * 본문 마크다운 → HTML + 기존 블로그 서식 후처리.
 * - 본문 안 HTML(FAQ schema 등)은 그대로 통과(html:true)
 * - 본문 H1 → H2 변환 (글 제목은 페이지가 별도 H1로 출력)
 * - H2/H3에 텍스트 기반 id 자동 부여 (TOC·앵커용, 기존 preprocessContent 이식)
 */
export function renderMarkdownToHtml(bodyMd: string): string {
  const rawHtml = md.render(bodyMd || "")
  const $ = cheerio.load(rawHtml, null, false)

  // 본문 첫 H1(= 글 제목, 마케터 가이드상 본문 최상단) 제거 — 페이지가 제목을 별도 H1로 출력하므로 중복
  $("h1").first().remove()
  // 혹시 남은 H1은 H2로 강등 (본문 내 중간 H1 방지)
  $("h1").each((_, el) => {
    const $el = $(el)
    $el.replaceWith($("<h2></h2>").html($el.html() ?? ""))
  })

  // "💡 핵심 요약" 섹션 제거 — 페이지 상단 요약 박스(summary_text)와 중복.
  // 헤딩 + 내용 + 바로 뒤 구분선(hr)까지만 제거하고, 그 다음 인트로는 유지.
  const $summary = $("h2, h3")
    .filter((_, el) => /핵심\s*요약/.test($(el).text()))
    .first()
  if ($summary.length) {
    let $n = $summary.next()
    $summary.remove()
    while ($n.length) {
      const $tmp = $n.next()
      const isHr = $n.is("hr")
      if ($n.is("h2, h3")) break // 다음 섹션 헤딩 만나면 중단 (안전장치)
      $n.remove()
      if (isHr) break // 핵심요약 직후 첫 구분선까지만
      $n = $tmp
    }
  }

  const counter: Record<string, number> = {}
  $("h2, h3").each((_, el) => {
    const $el = $(el)
    if ($el.attr("id")) return
    const base = ($el.text() ?? "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\wㄱ-ㅎ가-힣ぁ-んァ-ン一-龯]/g, "")
    if (!base) return
    if (!counter[base]) {
      counter[base] = 1
      $el.attr("id", base)
    } else {
      counter[base] += 1
      $el.attr("id", `${base}-${counter[base]}`)
    }
  })

  return $.html()
}

export interface BlogPostFrontmatter {
  title?: string
  subtitle?: string
  slug?: string
  thumbnail?: string
  lang?: string
  status?: string
  // 분류 (마케터는 이름으로 입력)
  hospital?: string
  department?: string
  // [시술 중심 의원] 대분류 — 블로그 메뉴 필터 (사이트 실제 대분류명과 일치, 자동 매칭)
  product_category?: string
  // [시술 중심 의원] 상세페이지 — CTA 링크 대상 (사이트 실제 상세페이지명과 일치, 자동 매칭)
  product_page?: string
  // 키워드 (신규 명칭) — 마케터 md 표준
  topic_keyword?: string // 주제 키워드 (blog.keywords 매칭 + "OO 관련글 더보기" 헤딩)
  title_keyword?: string // 제목 키워드 (main_keyword)
  content_keywords?: string[] // 콘텐츠(보조) 키워드 (sub_keywords)
  // 키워드 (구 명칭, 하위호환)
  keyword?: string
  main_keyword?: string
  sub_keywords?: string[]
  meta_keywords?: string[]
  summary?: string
  meta_description?: string
  // 의료진 (이름)
  author_doctor?: string
  reviewer_doctors?: string[]
  // 발행
  published_at?: string
  // 스키마
  schema_type?: string
  main_schema?: string
  medical_schema?: string
  // 관련 글
  internal_links?: Array<{ anchor: string; slug: string; location?: string }>
  citations?: Array<{ url: string; title?: string; publisher?: string; quote?: string }>
  // 직접 ID 입력도 허용 (하위호환)
  keyword_id?: string
  product_category_id?: string
  author_doctor_id?: string
  [key: string]: unknown
}

export interface ParsedMarkdown {
  frontmatter: BlogPostFrontmatter
  bodyMd: string
}

/**
 * .md 파일 내용에서 frontmatter + 본문 분리.
 * 마케터가 frontmatter 위에 <!-- 주석 -->으로 GEO 메모를 두는 경우가 있어 먼저 제거.
 */
export function parseBlogMarkdown(markdown: string): ParsedMarkdown {
  // 1) 보이지 않는 문자(BOM·zero-width·제어문자) 제거 — 복붙 시 섞여 YAML 파싱 깨짐 방지
  let cleaned = markdown
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "") // zero-width space/joiner·BOM
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // 제어문자(탭/개행 제외)
    .replace(/^(\s*<!--[\s\S]*?-->\s*)+/, "") // 선행 GEO 메모 주석
  // 2) frontmatter(YAML) 블록 안의 유니코드 공백(NBSP·전각공백 등)만 일반 공백으로 — 들여쓰기 깨짐 방지(본문 보존)
  cleaned = cleaned.replace(
    /^(---\r?\n)([\s\S]*?)(\r?\n---)/,
    (_m, open: string, body: string, close: string) =>
      open + body.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ") + close,
  )
  const parsed = matter(cleaned)
  return {
    frontmatter: (parsed.data || {}) as BlogPostFrontmatter,
    bodyMd: (parsed.content || "").trim(),
  }
}

/**
 * 본문 "## 💡 핵심 요약" 섹션의 본문 단락 추출 (헤딩 ~ 다음 헤딩/수평선 전까지).
 * 본문에는 그대로 두고 summary_text로만 복사 (변환 spec 3절).
 */
export function extractSummaryFromBody(bodyMd: string): string | null {
  const match = bodyMd.match(/^##\s*(?:💡\s*)?핵심\s*요약\s*$/m)
  if (!match || match.index === undefined) return null

  const afterHeading = bodyMd.slice(match.index + match[0].length)
  const endMatch = afterHeading.match(/\n\s*(?:##\s|---\s*$)/m)
  const section = endMatch ? afterHeading.slice(0, endMatch.index) : afterHeading

  const text = section
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith(">"))
    .join(" ")
    .trim()

  return text || null
}

/**
 * medical_schema / main_schema (yaml multiline JSON 문자열) → 객체 파싱.
 * 파싱 실패 시 null (발행은 진행).
 */
export function parseMedicalSchema(raw?: string): Record<string, unknown> | null {
  if (!raw || typeof raw !== "string") return null
  try {
    return JSON.parse(raw.trim())
  } catch {
    return null
  }
}
