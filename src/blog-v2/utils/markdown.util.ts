import * as matter from "gray-matter"

export interface BlogPostFrontmatter {
  title?: string
  subtitle?: string
  slug?: string
  thumbnail?: string
  lang?: string
  status?: string
  summary?: string
  meta_description?: string
  main_keyword?: string
  sub_keywords?: string[]
  meta_keywords?: string[]
  keyword_id?: string
  product_category_id?: string
  author_doctor_id?: string
  citations?: Array<{ url: string; title?: string; publisher?: string; quote?: string }>
  [key: string]: unknown
}

export interface ParsedMarkdown {
  frontmatter: BlogPostFrontmatter
  bodyMd: string
}

/**
 * .md 파일 내용에서 frontmatter + 본문 분리.
 *
 * 예:
 * ---
 * title: 보톡스 시술 후 운동
 * slug: botox-exercise-timing
 * ---
 * 본문 마크다운...
 */
export function parseBlogMarkdown(markdown: string): ParsedMarkdown {
  const parsed = matter(markdown)
  return {
    frontmatter: (parsed.data || {}) as BlogPostFrontmatter,
    bodyMd: (parsed.content || "").trim(),
  }
}
