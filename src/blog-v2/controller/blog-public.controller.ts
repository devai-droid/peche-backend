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
   * CloudFront 함수가 부여한 `x-bot` 헤더가 봇 이름이면(예: "GPTBot") GA에 기록 + 캐시 무효.
   * - 헤더값이 "0" 이거나 비어있으면 사람 → 무시
   * - 헤더값이 봇 이름이면: (1) Cache-Control: no-store 설정 (캐시되면 다음 봇 요청에 GA 누락)
   *                       (2) bot_read 이벤트 fire-and-forget 전송
   * CloudFront가 UA를 백엔드까지 전달하지 않으므로 봇 이름은 헤더에서만 얻음.
   */
  private handleBotRequest(
    req: Request,
    res: Response,
    pagePath: string,
    lang: string,
    postSlug?: string,
  ): void {
    const botName = ((req.headers["x-bot"] as string | undefined) ?? "0").trim()
    if (!botName || botName === "0") return
    res.setHeader("Cache-Control", "no-store, max-age=0")
    void this.botAnalytics.trackBotRead({ botName, pagePath, lang, postSlug })
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
