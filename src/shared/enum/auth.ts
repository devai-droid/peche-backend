export enum AuthExceptionType {
  WRONG_ATTEMPT = "카카오톡을 통해 가입하셨습니다. 카카오톡 로그인을 사용해 주세요.",
  UNAUTHORIZED = "잘못된 사용자 인증 정보입니다.",
  KAKAKO_API_USER_ME = "카카오 계정 정보를 가져오는 도중 오류가 발생했습니다.",
  KAKAKO_API_USER_AGREEMENT = "카카오 계정의 동의한 약관 정보를 가져오는 도중 오류가 발생했습니다.",
  WRONG_CERT_INFO = "본인 인증 받은 정보와 동일하지 않습니다.",
  DIFF_PHONE_NUMBER = "입력하신 전화번호와 본인 인증 받은 전화번호가 같지 않습니다.",
  FAIL_CERT = "본인 인증에 실패했습니다.",
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum AuthProvider {
  ORIGIN = "ORIGIN",
  GOOGLE = "GOOGLE",
  KAKAO = "KAKAO",
  NAVER = "NAVER",
}

export enum LanguageLocale {
  ko = "ko",
  en = "en",
  zh = "zh",
  zhTW = "zh-TW",
  ja = "ja",
  th = "th",
}

export const PINPOINT_LOCALE_CODE = {
  [LanguageLocale.ko]: "KR",
  [LanguageLocale.en]: "EN",
  [LanguageLocale.zh]: "CN",
  [LanguageLocale.zhTW]: "CN",
  [LanguageLocale.ja]: "JP",
  [LanguageLocale.th]: "TH",
}

export const DAYJS_LOCALE_CODE = {
  [LanguageLocale.ko]: "ko",
  [LanguageLocale.en]: "en",
  [LanguageLocale.zh]: "zh-cn",
  [LanguageLocale.zhTW]: "zh-tw",
  [LanguageLocale.ja]: "ja",
  [LanguageLocale.th]: "th",
}

export enum NiceCertificationType {
  M = "휴대폰",
  X = "인증서공통",
  U = "공동인증서",
  F = "금융인증서",
  S = "PASS인증서",
  C = "신용카드",
}

export function niceCertificationTypeCode(certType?: NiceCertificationType) {
  switch (certType) {
    case NiceCertificationType.M:
      return "M"
    case NiceCertificationType.X:
      return "X"
    case NiceCertificationType.U:
      return "U"
    case NiceCertificationType.F:
      return "F"
    case NiceCertificationType.S:
      return "S"
    case NiceCertificationType.C:
      return "C"
    default:
      return ""
  }
}
