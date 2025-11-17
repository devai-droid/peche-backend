export interface KakaoProfile {
  name?: string
  nickname?: string
  thumbnail_image_url?: string
  profile_image_url?: string
  is_default_image?: boolean
}

export interface KakaoAccount {
  has_phone_number?: boolean
  phone_number_needs_agreement?: boolean
  phone_number?: string
  name?: string
  email?: string
  birthday?: string
  birthyear?: string
  gender?: string
  profile?: KakaoProfile
}

export interface KakaoUserMeResponse {
  id: number
  connected_at?: string
  kakao_account?: KakaoAccount
}

export interface AllowedServiceTerms {
  tag: string
  agreed_at: string
}

export interface AppServiceTerms {
  tag: string
  created_at: string
  updated_at: string
}

export interface KakaoUserAgreementResponse {
  user_id: number
  allowed_service_terms?: AllowedServiceTerms[]
  app_service_terms?: AppServiceTerms[]
}
