export enum BlogPostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
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
