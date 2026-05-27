/**
 * 페슈 사이트 가변요소 (사이트별 응집).
 * 공통 렌더러는 이 config를 주입받아 동작 — 다른 사이트 추가 시 config만 교체.
 */
export interface SiteConfig {
  hospitalName: string
  baseUrl: string
  adminUrl: string
  organizationType: string // schema.org @type (MedicalClinic 등)
  logoUrl?: string
  ogDefaultImage?: string
  address?: { street?: string; locality?: string; region?: string; postalCode?: string; country?: string }
  telephone?: string
  sameAs?: string[] // 공식 SNS
  knowsAbout?: string[] // 진료 영역
  defaultLang: string
  supportedLangs: string[]
  cta?: { text: string; url: string } // 글 하단 공통 CTA
  treatmentListPath?: string // 전체시술 페이지 경로 (시술 대분류 카드 링크용)
  indexNowKey?: string // IndexNow 공개 키 (네이버·Bing 색인 즉시 통보). /{key}.txt 로 사이트 루트에 호스팅됨
}

export const PECHE_SITE: SiteConfig = {
  hospitalName: "페슈의원",
  baseUrl: "https://pecheskin.clinic",
  adminUrl: "https://admin.pecheskin.clinic",
  organizationType: "MedicalClinic",
  logoUrl: "https://pecheskin.clinic/logo.png",
  address: {
    locality: "강남구",
    region: "서울특별시",
    country: "KR",
  },
  sameAs: ["https://blog.naver.com/pecheclinic"],
  knowsAbout: ["보톡스", "필러", "스킨부스터", "리프팅", "울쎄라", "레이저"],
  defaultLang: "ko",
  supportedLangs: ["ko", "en", "zh", "zh-TW", "ja", "th"],
  cta: { text: "상담 예약하기", url: "/reservation" },
  treatmentListPath: "/products",
  // 공개 키 — peche-frontend/public/{key}.txt 로 사이트 루트에 동일하게 호스팅 (https://pecheskin.clinic/{key}.txt)
  indexNowKey: "9f26df7c8f4d2d0ea8ddf7ac5da0dd82",
}
