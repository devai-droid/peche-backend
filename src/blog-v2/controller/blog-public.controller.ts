import { Controller, Get, Param, Req, Res } from "@nestjs/common"
import { Request, Response } from "express"
import { ApiExcludeController } from "@nestjs/swagger"
import { BlogRenderService } from "@root/blog-v2/services/blog-render.service"
import { BotAnalyticsService } from "@root/blog-v2/services/bot-analytics.service"

/**
 * 공개 블로그 페이지 SSR.
 * 글로벌 프리픽스(/api) 제외 — main.ts setGlobalPrefix exclude에 등록.
 * 운영: CloudFront가 /{lang}/blog/* 를 백엔드로 라우팅.
 */
@ApiExcludeController()
@Controller()
export class BlogPublicController {
  constructor(
    private readonly renderService: BlogRenderService,
    private readonly botAnalytics: BotAnalyticsService,
  ) {}

  /**
   * CloudFront 함수가 부여한 헤더로 GA 분석 이벤트 발사 (UA·Referer를 origin까지 안 넘기므로 헤더 우회).
   * - `x-bot` 이 봇 이름(예: "GPTBot") → bot_read + 캐시 무효(캐시되면 다음 봇 요청에 GA 누락)
   * - 사람(x-bot="0")인데 `x-ai-ref` 이 AI 엔진(예: "ChatGPT") → ai_referral (AI 답변 링크 클릭 유입)
   * 둘 다 fire-and-forget. 캐시 히트 시 origin 미도달로 누락될 수 있음(저빈도라 감수).
   */
  private handleBotRequest(
    req: Request,
    res: Response,
    pagePath: string,
    lang: string,
    postSlug?: string,
  ): void {
    // 이름표에 없는 봇은 CloudFront 가 "other-bot|<UA 원문>" 꼴로 넘긴다. 파이프 앞뒤를 나눠 쓴다.
    const rawBot = ((req.headers["x-bot"] as string | undefined) ?? "0").trim()
    const pipe = rawBot.indexOf("|")
    const botName = pipe === -1 ? rawBot : rawBot.slice(0, pipe)
    const botUa = pipe === -1 ? undefined : rawBot.slice(pipe + 1).trim() || undefined
    if (botName && botName !== "0") {
      res.setHeader("Cache-Control", "no-store, max-age=0")
      void this.botAnalytics.trackBotRead({ botName, pagePath, lang, postSlug, botUa })
      return
    }
    // 사람: AI 답변에서 유입됐으면 ai_referral
    const aiRef = ((req.headers["x-ai-ref"] as string | undefined) ?? "0").trim()
    if (aiRef && aiRef !== "0") {
      res.setHeader("Cache-Control", "no-store, max-age=0")
      void this.botAnalytics.trackAiReferral({ referrerEngine: aiRef, pagePath, lang, postSlug })
    }
  }

  @Get("sitemap.xml")
  async sitemap(@Res() res: Response) {
    const xml = await this.renderService.renderSitemap()
    res.type("application/xml").send(xml)
  }

  @Get("robots.txt")
  robots(@Res() res: Response) {
    res.type("text/plain").send(this.renderService.renderRobots())
  }

  @Get("rss.xml")
  async rss(@Res() res: Response) {
    const xml = await this.renderService.renderRss()
    res.type("application/rss+xml").send(xml)
  }

  @Get(":lang/blog")
  async renderList(@Param("lang") lang: string, @Req() req: Request, @Res() res: Response) {
    const { html, status } = await this.renderService.renderListPage(lang)
    this.setCsp(res)
    this.handleBotRequest(req, res, `/${lang}/blog`, lang)
    res.status(status).type("html").send(html)
  }

  @Get(":lang/blog/:slug")
  async renderPost(
    @Param("lang") lang: string,
    @Param("slug") slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { html, status } = await this.renderService.renderPostPage(slug, lang)
    this.setCsp(res)
    this.handleBotRequest(req, res, `/${lang}/blog/${slug}`, lang, slug)
    res.status(status).type("html").send(html)
  }

  /** 시술 상세페이지 봇 SSR — /{lang}/products/{상세페이지 id}. 원고 있으면 200 SSR, 없으면 404(CloudFront가 SPA 폴백). */
  @Get(":lang/products/:id")
  async renderDetailPage(
    @Param("lang") lang: string,
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { html, status } = await this.renderService.renderDetailPage(id, lang)
    this.setCsp(res)
    this.handleBotRequest(req, res, `/${lang}/products/${id}`, lang)
    res.status(status).type("html").send(html)
  }

  /**
   * 블로그 공개 페이지용 CSP — SSR HTML이라 인라인 style + JSON-LD(ld+json) + 이미지(S3/로컬) 허용.
   * 기본 helmet의 upgrade-insecure-requests 제거(로컬 http 이미지 로드 위해).
   */
  private setCsp(res: Response) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' https: http: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self' https: data:",
    )
    res.removeHeader("Cross-Origin-Resource-Policy")
  }
}
