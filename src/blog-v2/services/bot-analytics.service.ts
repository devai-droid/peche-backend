import { Injectable, Logger } from "@nestjs/common"
import { randomUUID } from "crypto"
import { AwsHelper } from "@root/shared/helper/aws.helper"
import { INFRA_NAME, STATIC_CONFIG } from "@root/shared/constant/static-config"

/**
 * 봇 전용 GA4 속성("페슈 블로그 봇")에 SSR 봇 방문을 기록.
 *
 * - 트리거: CloudFront 갈림길에서 `x-bot=1` 헤더를 단 요청만 (블로그 SSR 컨트롤러에서 호출)
 * - 전송: GA4 Measurement Protocol (https://www.google-analytics.com/mp/collect)
 * - fire-and-forget: 응답 지연을 막기 위해 결과를 await 하지 않음. 실패해도 무시.
 *
 * 자격증명은 SSM에서 로드 (lazy, 첫 호출 시 1회). 메모리 캐시 후 재사용.
 *   /peche/{stage}/base/ga-bot/measurement-id  (String)
 *   /peche/{stage}/base/ga-bot/api-secret      (SecureString)
 */
@Injectable()
export class BotAnalyticsService {
  private readonly logger = new Logger(BotAnalyticsService.name)
  private creds?: { measurementId: string; apiSecret: string }
  private credsLoading?: Promise<void>

  private async loadCreds(): Promise<void> {
    if (this.creds) return
    if (this.credsLoading) {
      await this.credsLoading
      return
    }
    this.credsLoading = (async () => {
      const base = `/${INFRA_NAME}/${STATIC_CONFIG.STAGE}/base/ga-bot`
      const [measurementId, apiSecret] = await Promise.all([
        AwsHelper.getParameter(`${base}/measurement-id`),
        AwsHelper.getParameter(`${base}/api-secret`, true),
      ])
      if (!measurementId || !apiSecret) {
        this.logger.warn(`GA bot tracking creds missing at ${base}; events will be skipped`)
        return
      }
      this.creds = { measurementId, apiSecret }
    })()
    try {
      await this.credsLoading
    } finally {
      this.credsLoading = undefined
    }
  }

  /**
   * `bot_read` 이벤트를 GA4로 전송. fire-and-forget(호출자가 await 안 해도 됨).
   * - botName 은 CloudFront 함수가 UA 보고 부여한 x-bot 헤더값(예: "GPTBot", "Googlebot")
   *   CloudFront가 백엔드 origin으로 가는 길에 UA를 차단하기 때문에 헤더 우회가 필요함.
   * - 호출 전에 컨트롤러에서 봇 여부 가드(x-bot !== "0").
   */
  async trackBotRead(input: {
    botName: string
    pagePath: string
    lang: string
    postSlug?: string
  }): Promise<void> {
    try {
      await this.loadCreds()
      if (!this.creds) return // 자격증명 미설정 — silently skip

      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
        this.creds.measurementId,
      )}&api_secret=${encodeURIComponent(this.creds.apiSecret)}`
      const body = {
        client_id: randomUUID(),
        events: [
          {
            name: "bot_read",
            params: {
              bot_name: input.botName || "unknown-bot",
              page_path: input.pagePath,
              lang: input.lang,
              ...(input.postSlug ? { post_slug: input.postSlug } : {}),
            },
          },
        ],
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        this.logger.debug(`GA MP non-2xx (${res.status}) — bot_read drop`)
      }
    } catch (e) {
      this.logger.debug(`GA MP send failed silently: ${(e as Error).message}`)
    }
  }
}
