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

export interface BlogPostFaqItem {
  question: string
  answer: string
}
