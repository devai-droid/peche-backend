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

  /** CloudFront 갈림길에서 부여한 x-bot=1 헤더가 있을 때만 GA에 봇 방문 기록(fire-and-forget). */
  private trackIfBot(req: Request, pagePath: string, lang: string, postSlug?: string): void {
    const xBot = (req.headers["x-bot"] as string | undefined) ?? ""
    if (xBot !== "1") return
    const ua = (req.headers["user-agent"] as string | undefined) ?? ""
    void this.botAnalytics.trackBotRead({ userAgent: ua, pagePath, lang, postSlug })
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
    res.status(status).type("html").send(html)
    this.trackIfBot(req, `/${lang}/blog`, lang)
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
    res.status(status).type("html").send(html)
    this.trackIfBot(req, `/${lang}/blog/${slug}`, lang, slug)
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
