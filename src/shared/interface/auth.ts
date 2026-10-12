import { AuthProvider, LanguageLocale, Role } from "../enum/auth"
import { JwtHeader } from "jwt-decode"
import { CertSigningKey, RsaSigningKey } from "jwks-rsa"

export interface JwtPayload {
  id?: string
  phoneNumber?: string
  email?: string
  iss?: string
  exp?: number
  iat?: number
  roles?: Role[]
  locale?: LanguageLocale
  b2bVerificationId?: string // B2B 회사 이메일 인증 1건(예약 1건용) 식별자
}

export type TokenDecodedHeader = JwtHeader & { kid: string }

export type SignedKey = CertSigningKey | RsaSigningKey

export type KakaoIdTokenPayload = {
  iss: string
  aud: string
  sub: string
  iat: number
  auth_time: number
  exp: number
  nonce?: string
  nickname?: string
  picture?: string
  email?: string
}

export type SocialAuthPayload = {
  email?: string
  sub: string
  name?: string
  provider: AuthProvider
  picture?: string
}

export type NiceDict = { [key: string]: string }

export interface JWTInfo {
  JWT_SECRET: string
}
