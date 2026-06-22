import { Injectable, Logger } from "@nestjs/common"
import { randomUUID } from "crypto"
import { AwsHelper } from "@root/shared/helper/aws.helper"
import { INFRA_NAME, STATIC_CONFIG } from "@root/shared/constant/static-config"

/**
 * 봇 이름 → 의도 카테고리. GEO/AEO 분석에서 "실시간 인용(live-user)"을
 * 대량 학습수집(training)·색인(search-index)과 분리해 보기 위함.
 * 이름값은 CloudFront 함수(peche-blog-bot-tag)가 x-bot 으로 부여하는 값과 일치.
 */
const BOT_CATEGORY: Record<string, string> = {
  // 사람이 AI에 질문해서 실시간으로 페이지를 가져가는 케이스 (AEO 핵심 신호)
  "ChatGPT-User": "live-user",
  "Perplexity-User": "live-user",
  // 검색/답변 색인 구축
  "OAI-SearchBot": "search-index",
  PerplexityBot: "search-index",
  Googlebot: "search-index",
  "Googlebot-News": "search-index",
  "Googlebot-Image": "search-index",
  "Google-InspectionTool": "search-index",
  Bingbot: "search-index",
  BingPreview: "search-index",
  DuckDuckBot: "search-index",
  YandexBot: "search-index",
  BaiduSpider: "search-index",
  SogouSpider: "search-index",
  NaverYeti: "search-index",
  NaverBot: "search-index",
  Applebot: "search-index",
  Daum: "search-index",
  // 모델 학습용 대량 수집
  GPTBot: "training",
  ClaudeBot: "training",
  "Claude-Web": "training",
  "anthropic-ai": "training",
  CCBot: "training",
  "Google-Extended": "training",
  "Applebot-Extended": "training",
  Bytespider: "training",
  // 광고 크롤러
  "AdsBot-Google": "ads",
  "Mediapartners-Google": "ads",
  // SNS 링크 미리보기
  KakaoTalk: "social",
  KakaoBot: "social",
  FacebookExternalHit: "social",
  TwitterBot: "social",
  LinkedInBot: "social",
  Slackbot: "social",
  Discordbot: "social",
  WhatsApp: "social",
  TelegramBot: "social",
  // SEO 도구
  AhrefsBot: "seo-tool",
  SemrushBot: "seo-tool",
  MJ12bot: "seo-tool",
  DotBot: "seo-tool",
}

/**
 * 봇 전용 GA4 속성("페슈 블로그 AI봇 탐지")에 SSR 트래픽을 기록.
 *
 * 두 종류 이벤트:
 *  - bot_read     : 봇이 글을 읽음 (수집/색인/실시간인용). CloudFront x-bot 헤더 기반.
 *  - ai_referral  : 사람이 AI 답변 링크를 클릭해 유입 (GEO 전환 신호). CloudFront x-ai-ref 헤더 기반.
 *
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

  /** GA4 MP 로 단일 이벤트 전송 (fire-and-forget). 자격증명 없으면 silently skip. */
  private async send(eventName: string, params: Record<string, unknown>): Promise<void> {
    try {
      await this.loadCreds()
      if (!this.creds) return

      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
        this.creds.measurementId,
      )}&api_secret=${encodeURIComponent(this.creds.apiSecret)}`
      const body = {
        client_id: randomUUID(),
        events: [{ name: eventName, params }],
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        this.logger.debug(`GA MP non-2xx (${res.status}) — ${eventName} drop`)
      }
    } catch (e) {
      this.logger.debug(`GA MP send failed silently: ${(e as Error).message}`)
    }
  }

  /**
   * `bot_read` — 봇이 글을 읽음.
   * - botName 은 CloudFront 함수가 UA 보고 부여한 x-bot 헤더값(예: "GPTBot", "Googlebot")
   * - bot_category 로 의도(live-user/search-index/training/...)를 함께 기록.
   */
  async trackBotRead(input: {
    botName: string
    pagePath: string
    lang: string
    postSlug?: string
  }): Promise<void> {
    const botName = input.botName || "unknown-bot"
    await this.send("bot_read", {
      bot_name: botName,
      bot_category: BOT_CATEGORY[botName] ?? "other",
      page_path: input.pagePath,
      lang: input.lang,
      ...(input.postSlug ? { post_slug: input.postSlug } : {}),
    })
  }

  /**
   * `ai_referral` — 사람이 AI 답변(ChatGPT/Perplexity 등) 링크를 클릭해 유입.
   * - referrerEngine 은 CloudFront 함수가 Referer 보고 부여한 x-ai-ref 헤더값.
   * - GEO 의 실제 성과(AI가 방문자를 보냄)를 측정.
   */
  async trackAiReferral(input: {
    referrerEngine: string
    pagePath: string
    lang: string
    postSlug?: string
  }): Promise<void> {
    await this.send("ai_referral", {
      referrer_engine: input.referrerEngine,
      page_path: input.pagePath,
      lang: input.lang,
      ...(input.postSlug ? { post_slug: input.postSlug } : {}),
    })
  }
}
