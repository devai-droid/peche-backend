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
   * `bot_read` 이벤트를 GA4로 전송. 호출자는 `await` 안 해도 됨(fire-and-forget).
   * - userAgent / x-bot=1 인 경우에만 호출하는 것이 권장(컨트롤러에서 가드).
   */
  async trackBotRead(input: {
    userAgent: string
    pagePath: string
    lang: string
    postSlug?: string
  }): Promise<void> {
    try {
      await this.loadCreds()
      if (!this.creds) return // 자격증명 미설정 — silently skip

      const botName = this.extractBotName(input.userAgent)
      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
        this.creds.measurementId,
      )}&api_secret=${encodeURIComponent(this.creds.apiSecret)}`
      const body = {
        client_id: randomUUID(),
        events: [
          {
            name: "bot_read",
            params: {
              bot_name: botName,
              page_path: input.pagePath,
              lang: input.lang,
              ...(input.postSlug ? { post_slug: input.postSlug } : {}),
            },
          },
        ],
      }
      // node 20 native fetch
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

  /**
   * UA에서 봇 이름 추출. 잘 알려진 봇은 정확한 이름, 그 외는 -bot|crawl|spider 토큰으로 추정,
   * 그래도 못 찾으면 "unknown-bot".
   */
  private extractBotName(ua: string): string {
    if (!ua) return "unknown-bot"
    const known = [
      /GPTBot/i,
      /ChatGPT-User/i,
      /OAI-SearchBot/i,
      /ClaudeBot/i,
      /Claude-Web/i,
      /anthropic-ai/i,
      /CCBot/i,
      /PerplexityBot/i,
      /Perplexity-User/i,
      /Googlebot-News/i,
      /Googlebot-Image/i,
      /Googlebot/i,
      /Google-Extended/i,
      /Google-InspectionTool/i,
      /AdsBot-Google/i,
      /APIs-Google/i,
      /Mediapartners-Google/i,
      /bingbot/i,
      /BingPreview/i,
      /DuckDuckBot/i,
      /Bytespider/i,
      /Applebot-Extended/i,
      /Applebot/i,
      /YandexBot/i,
      /Baiduspider/i,
      /SogouSpider/i,
      /Sogou\s+web\s+spider/i,
      /Yeti/i,
      /NaverBot/i,
      /facebookexternalhit/i,
      /Twitterbot/i,
      /LinkedInBot/i,
      /Slackbot/i,
      /TelegramBot/i,
      /WhatsApp/i,
      /Discordbot/i,
      /AhrefsBot/i,
      /SemrushBot/i,
      /MJ12bot/i,
      /DotBot/i,
    ]
    for (const pat of known) {
      const m = ua.match(pat)
      if (m) return m[0]
    }
    const generic = ua.match(/[A-Za-z][\w.-]*(?:Bot|bot|Crawler|crawler|Spider|spider)/)
    if (generic) return generic[0]
    return "unknown-bot"
  }
}
