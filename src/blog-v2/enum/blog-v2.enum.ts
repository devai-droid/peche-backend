export enum BlogPostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// 글 노출 대상: 블로그 목록(기본) vs 시술 상세페이지(영상 아래 섹션)
export enum BlogPublishTarget {
  BLOG = "blog",
  DETAIL_PAGE = "detail_page",
}

export enum BlogPostLang {
  KO = "ko",
  EN = "en",
  ZH = "zh",
  ZH_TW = "zh-TW",
  JA = "ja",
  TH = "th",
}

// 내부 언어 코드는 표준 zh-TW를 쓰되, 사용자·검색엔진에 노출되는 URL 세그먼트는 짧게 tw로 표기한다.
// (프론트 헤더가 /zh-TW → /tw 로 리다이렉트하는 정책과 일치. 내부 조회·데이터는 zh-TW 유지)
/** 내부 언어 코드 → URL 세그먼트 (zh-TW → tw, 나머지 그대로) */
export const blogLangToUrlSeg = (lang: string): string => (lang === BlogPostLang.ZH_TW ? "tw" : lang)
/** URL 세그먼트 → 내부 언어 코드 (tw → zh-TW, 나머지 그대로) */
export const blogLangFromUrlSeg = (seg: string): string => (seg === "tw" ? BlogPostLang.ZH_TW : seg)

export interface BlogPostFaqItem {
  question: string
  answer: string
}
