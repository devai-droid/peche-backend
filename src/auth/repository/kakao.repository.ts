import * as _ from "lodash"
import * as jwksClient from "jwks-rsa"
import * as jwt from "jsonwebtoken"
import { BadRequestException, Injectable, Logger } from "@nestjs/common"
import axios, { AxiosInstance } from "axios"
import { ConfigService } from "@nestjs/config"
import { isMobilePhone } from "class-validator"
import { Env } from "@root/shared/enum/env"
import {
  AllowedServiceTerms,
  KakaoAccount,
  KakaoProfile,
  KakaoUserAgreementResponse,
  KakaoUserMeResponse,
} from "@root/auth/dto/kakao.dto"
import { KakaoIdTokenPayload, SignedKey, SocialAuthPayload, TokenDecodedHeader } from "@root/shared/interface/auth"
import { AuthExceptionType, AuthProvider } from "@root/shared/enum/auth"
import { AuthException } from "@root/shared/exception/auth-exception"
import { KAKAO_MARKETING_ACCEPTED_TAG, KAKAO_OAUTH_ISSUER, KAKAO_PUBLIC_KEY_URL } from "@root/shared/constant/auth"
import { UserStatus } from "@root/shared/enum/user"
import { jwtDecode } from "jwt-decode"

@Injectable()
export class KakaoRepository {
  private readonly logger = new Logger(KakaoRepository.name)
  private readonly KakaoApiBase = "https://kapi.kakao.com/"
  private readonly KakaoAdminKeyName = "KakaoAK"
  private readonly kakaoTargetIdTypeUserId = "user_id"
  private kakaoApi: AxiosInstance
  private kakaoJwksClient: jwksClient.JwksClient

  constructor(private config: ConfigService) {
    const kakaoAdminKey = config.get<string>(Env.KAKAO_APP_ADMIN_KEY)
    this.kakaoApi = axios.create({
      baseURL: this.KakaoApiBase,
      headers: {
        Authorization: `${this.KakaoAdminKeyName} ${kakaoAdminKey}`,
      },
    })
    this.kakaoJwksClient = jwksClient({
      jwksUri: KAKAO_PUBLIC_KEY_URL,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000,
    })
  }

  async usersMe(providerSub?: string) {
    this.checkProviderSub(providerSub)
    try {
      return await this.requestUsersMe(providerSub)
    } catch (e: unknown) {
      this.logger.error("userMe failed", e)
      throw new AuthException(AuthExceptionType.KAKAKO_API_USER_ME)
    }
  }

  getPhoneNumber(kakaoUser?: KakaoUserMeResponse) {
    const phoneNumber = kakaoUser?.kakao_account?.phone_number
    const kakaoPhoneNumber = phoneNumber?.replaceAll("+82 ", "0")

    if (!isMobilePhone(kakaoPhoneNumber, "ko-KR")) {
      console.log("number?", kakaoPhoneNumber)
      throw new BadRequestException("카카오 톡을 통해 제공된 휴대폰 번호가 없거나 올바르지 않습니다.")
    }
    return phoneNumber?.replaceAll(" ", "").replaceAll("-", "")
  }

  getEmail(kakaoUser?: KakaoUserMeResponse) {
    return kakaoUser?.kakao_account?.email
  }

  getNickname(kakaoUser?: KakaoUserMeResponse) {
    return kakaoUser?.kakao_account?.profile?.nickname
  }

  getUserName(payload: SocialAuthPayload, kakaoUser: KakaoAccount) {
    return kakaoUser?.name ? kakaoUser?.name : payload.name
  }

  async getVerifiedIdTokenPayload(token: string): Promise<SocialAuthPayload> {
    try {
      const signingKey = await this.getPublicKey(token)
      const payload: KakaoIdTokenPayload = <KakaoIdTokenPayload>jwt.verify(token, signingKey)
      this.validateIssAndAud(payload)
      return <SocialAuthPayload>{
        sub: payload.sub,
        provider: AuthProvider.KAKAO,
      }
    } catch (e) {
      this.logger.error("Error occurred while verifying Kakao id_token", e)
      throw new AuthException(AuthExceptionType.UNAUTHORIZED)
    }
  }

  getBirthdate(kakaoAccount?: KakaoAccount) {
    return kakaoAccount?.birthyear && kakaoAccount?.birthday
      ? `${kakaoAccount.birthyear}${kakaoAccount.birthday}`
      : null
  }

  getProfileImageUrl(profile?: KakaoProfile): string | null {
    if (profile?.is_default_image == false) {
      return profile.profile_image_url
    }
    return null
  }

  async getMarketingAccepted(providerSub?: string) {
    const agreement = await this.usersAgreement(providerSub)
    return this.isMarketingAccepted(agreement.allowed_service_terms)
  }

  private async usersAgreement(providerSub?: string) {
    this.checkProviderSub(providerSub)
    try {
      return await this.requestUsersAgreement(providerSub)
    } catch (e: unknown) {
      this.logger.error("usersAgreement failed", e)
      throw new AuthException(AuthExceptionType.KAKAKO_API_USER_AGREEMENT)
    }
  }

  private isMarketingAccepted(allowedServiceTerms?: AllowedServiceTerms[]) {
    return allowedServiceTerms?.some((term) => term.tag == KAKAO_MARKETING_ACCEPTED_TAG && term.agreed_at) ?? false
  }

  private checkProviderSub(kakaoProviderSub: string) {
    if (!kakaoProviderSub) {
      throw new BadRequestException("카카오 사용자 아이디 값이 없습니다.")
    }
  }

  private validateIssAndAud(token: KakaoIdTokenPayload): void {
    if (token.iss !== KAKAO_OAUTH_ISSUER) {
      throw new AuthException(AuthExceptionType.UNAUTHORIZED)
    }
    if (!_.includes(this.getIdTokenAudience(), token.aud)) {
      throw new AuthException(AuthExceptionType.UNAUTHORIZED)
    }
  }

  private getIdTokenAudience() {
    return [this.config.get<string>(Env.KAKAO_APP_REST_KEY), this.config.get<string>(Env.KAKAO_APP_JAVASCRIPT_KEY)]
  }

  private async getPublicKey(token: string) {
    const decodedHeader = jwtDecode<TokenDecodedHeader>(token, { header: true })
    const key: SignedKey = await this.kakaoJwksClient.getSigningKey(decodedHeader.kid)
    const certSigningKey = key.getPublicKey()
    if (!certSigningKey) {
      throw new AuthException(AuthExceptionType.UNAUTHORIZED)
    }
    return certSigningKey
  }

  private async requestUsersMe(kakaoProviderSub: string) {
    const { data } = await this.kakaoApi.get(`${this.KakaoApiBase}/v2/user/me`, {
      params: {
        target_id: kakaoProviderSub,
        target_id_type: this.kakaoTargetIdTypeUserId,
      },
    })
    return data as KakaoUserMeResponse
  }

  private async requestUsersAgreement(kakaoProviderSub: string) {
    const { data } = await this.kakaoApi.get(`${this.KakaoApiBase}/v1/user/service/terms`, {
      params: {
        target_id: kakaoProviderSub,
        target_id_type: this.kakaoTargetIdTypeUserId,
      },
    })
    return data as KakaoUserAgreementResponse
  }
}
