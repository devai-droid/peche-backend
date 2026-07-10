import { Injectable } from "@nestjs/common"
import * as cheerio from "cheerio"
import { BlogV2PostService, BlogPriceGroup } from "@root/blog-v2/services/blog-v2-post.service"
import { BlogSiteConfigService } from "@root/blog-v2/services/blog-site-config.service"
import { BlogSiteConfig } from "@root/blog-v2/entities/site-config.entity"
import { BlogPostV2 } from "@root/blog-v2/entities/post.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { PECHE_SITE, SiteConfig } from "@root/blog-v2/sites/peche.config"

/** 빵부스러기(Breadcrumb)용 대분류·상세페이지 노드 */
type BlogBreadcrumb = {
  category: { id: string; name: string } | null
  detailPage: { id: string; name: string } | null
}

function esc(s?: string): string {
  if (!s) return ""
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

// 목차 라벨 (언어별) — SSR nav aria-label·제목에 사용
const TOC_LABEL: Record<string, string> = {
  ko: "목차",
  en: "Contents",
  zh: "目录",
  "zh-TW": "目錄",
  ja: "目次",
  th: "สารบัญ",
}

// 출처(각주) 하단 목록 제목 (언어별)
const REF_LABEL: Record<string, string> = {
  ko: "출처",
  en: "References",
  zh: "参考来源",
  "zh-TW": "參考來源",
  ja: "出典",
  th: "แหล่งอ้างอิง",
}

const TYPOGRAPHY_CSS = `
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,'Apple SD Gothic Neo','Pretendard',sans-serif;color:#2b2b2b;line-height:1.8;background:#fff}
  .blog-header{border-bottom:1px solid #eee;padding:16px 24px}
  .blog-header a{color:#DA7F67;text-decoration:none;font-weight:700;font-size:18px}
  .blog-wrap{max-width:800px;margin:0 auto;padding:32px 24px 80px}
  .blog-title{font-size:26px;font-weight:700;line-height:1.35;margin:0 0 8px}
  .blog-subtitle{font-size:16px;color:#666;margin:0 0 24px}
  .blog-thumb{width:100%;height:auto;border-radius:2px;margin:16px 0 28px}
  .blog-summary{background:#FEF5EA;border-left:4px solid #DA7F67;padding:16px 18px;border-radius:4px;margin:0 0 32px;font-size:16px}
  /* 본문 — v1 블로그(blog-detail) typography와 일치 */
  .blog-content{font-size:16px;line-height:1.8;color:#1a1a1a}
  .blog-content h1,.blog-content h2,.blog-content h3,.blog-content h4{font-weight:600;margin-top:1.5em;margin-bottom:0.5em;line-height:1.3;scroll-margin-top:80px}
  .blog-content h2{font-size:1.7em}
  .blog-content h3{font-size:1.15em}
  .blog-content p{margin-bottom:1em}
  .blog-content ul{list-style-type:disc;padding-left:1.5em;margin-bottom:1em}
  .blog-content ol{list-style-type:decimal;padding-left:1.5em;margin-bottom:1em}
  .blog-content li{margin-bottom:0.25em}
  .blog-content blockquote{border-left:3px solid #da7f67;padding-left:1em;margin:1em 0;color:#666}
  .blog-content a{color:#da7f67;text-decoration:underline}
  .blog-content img{max-width:100%;height:auto;border-radius:2px;margin:1em 0}
  .blog-content em{display:block;text-align:center;font-size:13px;color:#888;margin-top:-0.5em;margin-bottom:1.5em}
  .blog-content table{width:100%;border-collapse:collapse;margin:1em 0}
  .blog-content th,.blog-content td{border:1px solid #e0e0e0;padding:10px 12px;text-align:left}
  .blog-content th{background:#f7f7f7;font-weight:600}
  .blog-content hr{border:none;border-top:1px solid #eee;margin:2em 0}
  .schema-faq-question{padding:16px 18px;margin:16px 0;border-left:4px solid #DA7F67;background:#faf7f5;border-radius:4px}
  .schema-faq-question strong{display:block;margin-bottom:8px}
  .blog-toc{background:#f9f7f5;border-radius:8px;padding:16px 20px;margin:0 0 32px}
  .blog-toc .toc-title{font-weight:700;margin-bottom:8px;font-size:15px}
  .blog-toc ul{list-style:none;padding:0;margin:0}
  .blog-toc li{margin:5px 0;font-size:14px}
  .blog-toc li.toc-h3{padding-left:16px;font-size:13px}
  .blog-toc a{color:#555;text-decoration:none}
  .blog-toc a:hover{color:#DA7F67}
  .author-card{display:flex;gap:16px;align-items:center;background:#faf7f5;border-radius:8px;padding:20px;margin:40px 0 0}
  .ac-photo{width:64px;height:64px;border-radius:50%;object-fit:cover;flex-shrink:0}
  .ac-photo-empty{display:flex;align-items:center;justify-content:center;background:#DA7F67;color:#fff;font-size:24px;font-weight:700}
  .ac-label{font-size:12px;color:#DA7F67;font-weight:600;margin-bottom:4px}
  .ac-name{font-size:17px;font-weight:700}
  .ac-meta{font-size:14px;color:#666;margin-top:2px}
  .ac-assoc{font-size:13px;color:#888;margin-top:4px}
  .blog-related{margin:40px 0 0}
  .blog-related h2{font-size:20px;font-weight:700;margin:0 0 12px}
  .blog-related ul{list-style:none;padding:0;margin:0}
  .blog-related li{margin:8px 0}
  .blog-related a{color:#DA7F67;text-decoration:none;font-size:15px}
  .blog-related a:hover{text-decoration:underline}
  .cite-ref{font-size:0.7em;line-height:0;margin-left:1px}
  .cite-ref a{color:#DA7F67;font-weight:600;text-decoration:none;padding:0 1px}
  .blog-references{margin:40px 0 0}
  .blog-references h2{font-size:18px;font-weight:700;margin:0 0 12px}
  .blog-references ol{padding-left:1.4em;margin:0}
  .blog-references li{font-size:14px;color:#666;margin:6px 0;line-height:1.5}
  .blog-references a{color:#8a8a8a;text-decoration:none;word-break:break-all}
  .blog-references a:hover{text-decoration:underline}
  .blog-references .ref-back{color:#DA7F67;word-break:normal}
  .blog-cta{margin:40px 0 0;text-align:center}
  .cta-btn{display:inline-block;background:#DA7F67;color:#fff;padding:14px 36px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px}
  .cta-btn:hover{background:#c56b54}
  .blog-price{margin:40px 0 0}
  .ps-group{margin:0 0 52px}
  .ps-group>h2{font-size:19px;font-weight:700;margin:0 0 12px}
  .ps-tab{margin:0 0 20px}
  .ps-tab>h3{font-size:15px;font-weight:600;color:#DA7F67;margin:0 0 8px}
  .ps-card{display:flex;flex-direction:column;gap:8px;padding:16px 4px;border-bottom:1px solid #eee}
  .ps-main{display:flex;flex-direction:column;gap:6px;min-width:0}
  .ps-chips{display:flex;gap:4px}
  .ps-chip{font-size:12px;font-weight:600;color:#8D7B64;background:#F4F4F4;border-radius:4px;padding:3px 6px;line-height:1}
  .ps-name{font-size:17px;font-weight:600;color:#121212}
  .ps-cat{color:#DA7F67}
  .ps-desc{font-size:13px;color:#666}
  .ps-price{white-space:nowrap}
  .ps-price del{color:#9B9B9B;margin-right:6px;font-size:13px}
  .ps-price strong{color:#AB6655;font-size:16px}
  .ps-more{display:inline-block;margin-top:10px;color:#AB6655;font-weight:600;font-size:14px;text-decoration:none}
  @media(min-width:768px){.ps-card{flex-direction:row;align-items:center;gap:20px}.ps-main{flex:1}}
  .blog-footer{border-top:1px solid #eee;padding:32px 24px;text-align:center;color:#999;font-size:13px}
`

@Injectable()
export class BlogRenderService {
  private readonly site: SiteConfig = PECHE_SITE

  constructor(
    private readonly postService: BlogV2PostService,
    private readonly siteConfigService: BlogSiteConfigService,
  ) {}

  async renderPostPage(slug: string, lang: string): Promise<{ html: string; status: number }> {
    const post = await this.postService.findBySlug(slug, lang)
    if (post) {
      const priceGroups = await this.postService.getBlogPriceData(post.priceRefs, post.productPage, post.lang)
      const relatedSlugs = (post.internalLinks ?? []).map((l) => l.slug)
      const titleMap = await this.postService.getPublishedTitlesBySlugs(relatedSlugs, post.lang)
      const cfg = await this.siteConfigService.getMerged(post.lang).catch(() => null)
      const breadcrumb = await this.postService.getPostBreadcrumb(post.productCategoryId, post.productPage)
      const reviewerDoctors = await this.postService.getReviewerDoctors(post.reviewerDoctorIds)
      const pageProcedures = await this.postService.getProductPageProcedures(post.productPage)
      return {
        html: this.buildHtml(post, priceGroups, titleMap, cfg, breadcrumb, reviewerDoctors, pageProcedures),
        status: 200,
      }
    }
    // 이름 변경 등으로 사라진 옛 주소(슬러그 이력에 있음) → 410 Gone
    // (CloudFront는 404/403만 index.html로 바꾸고 410은 통과 → 검색엔진에 "영구 삭제" 전달)
    if (await this.postService.isHistoricalSlug(slug, lang)) {
      return { html: this.render410(), status: 410 }
    }
    return { html: this.render404(), status: 404 }
  }

  async renderListPage(lang: string): Promise<{ html: string; status: number }> {
    const { items } = await this.postService.findMany({ lang: lang as never, status: "published" as never, page: 1, limit: 50 })
    return { html: this.buildListHtml(items, lang), status: 200 }
  }

  /** sitemap.xml — 발행 글 전체 (언어 무관) */
  async renderSitemap(): Promise<string> {
    const { items } = await this.postService.findMany({ status: "published" as never, page: 1, limit: 1000 })
    const urls = items
      .map((p) => {
        const loc = `${this.site.baseUrl}/${p.lang}/blog/${encodeURIComponent(p.slug)}`
        const lastmod = new Date((p.updatedAt as unknown as Date) ?? p.publishedAt ?? new Date()).toISOString()
        return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
      })
      .join("\n")
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  }

  /** robots.txt — AI 크롤러 명시 + sitemap 링크 */
  renderRobots(): string {
    return `User-agent: *
Allow: /

# AI 검색 크롤러 (GEO/AEO)
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${this.site.baseUrl}/sitemap.xml`
  }

  /** rss.xml — 발행 글 피드 */
  async renderRss(): Promise<string> {
    const { items } = await this.postService.findMany({ status: "published" as never, page: 1, limit: 50 })
    const entries = items
      .map((p) => {
        const link = `${this.site.baseUrl}/${p.lang}/blog/${encodeURIComponent(p.slug)}`
        const pub = new Date(p.publishedAt ?? new Date()).toUTCString()
        return `  <item>
    <title>${esc(p.title)}</title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${pub}</pubDate>
    ${p.summaryText ? `<description>${esc(p.summaryText)}</description>` : ""}
  </item>`
      })
      .join("\n")
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${esc(this.site.hospitalName)} 블로그</title>
  <link>${this.site.baseUrl}/${this.site.defaultLang}/blog</link>
  <description>${esc(this.site.hospitalName)} 블로그</description>
${entries}
</channel></rss>`
  }

  private buildListHtml(posts: BlogPostV2[], lang: string): string {
    const site = this.site
    const cards = posts
      .map((p) => {
        const url = `${site.baseUrl}/${lang}/blog/${encodeURIComponent(p.slug)}`
        return `<a class="blog-card" href="/${lang}/blog/${encodeURIComponent(p.slug)}">
${p.thumbnailUrl ? `<div class="card-thumb"><img src="${esc(p.thumbnailUrl)}" alt="${esc(p.title)}"></div>` : `<div class="card-thumb card-thumb-empty"></div>`}
<div class="card-body">
${p.mainKeyword ? `<span class="card-tag">${esc(p.mainKeyword)}</span>` : ""}
<h3 class="card-title">${esc(p.title)}</h3>
${p.summaryText ? `<p class="card-desc">${esc(p.summaryText.slice(0, 90))}…</p>` : ""}
</div></a>`
      })
      .join("\n")

    return `<!DOCTYPE html>
<html lang="${esc(lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>블로그 | ${esc(site.hospitalName)}</title>
<meta name="description" content="${esc(site.hospitalName)} 블로그">
<style>${TYPOGRAPHY_CSS}
  .blog-list{max-width:1080px;margin:0 auto;padding:40px 24px 80px}
  .blog-list h1{font-size:28px;font-weight:700;margin:0 0 28px}
  .card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}
  .blog-card{display:block;border:1px solid #eee;border-radius:8px;overflow:hidden;text-decoration:none;color:inherit;transition:box-shadow .2s}
  .blog-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)}
  .card-thumb{aspect-ratio:16/10;overflow:hidden;background:#f5f5f5}
  .card-thumb img{width:100%;height:100%;object-fit:cover}
  .card-body{padding:16px}
  .card-tag{display:inline-block;font-size:12px;color:#DA7F67;font-weight:600;margin-bottom:6px}
  .card-title{font-size:17px;font-weight:700;margin:0 0 8px;line-height:1.4}
  .card-desc{font-size:14px;color:#666;margin:0;line-height:1.6}
</style>
</head>
<body>
<header class="blog-header"><a href="/${lang}/blog">${esc(site.hospitalName)} 블로그</a></header>
<main class="blog-list">
<h1>블로그</h1>
${posts.length ? `<div class="card-grid">${cards}</div>` : `<p>아직 발행된 글이 없습니다.</p>`}
</main>
<footer class="blog-footer">© ${esc(site.hospitalName)}</footer>
</body>
</html>`
  }

  private buildHtml(
    post: BlogPostV2,
    priceGroups: BlogPriceGroup[] = [],
    relatedTitles: Record<string, string> = {},
    cfg: BlogSiteConfig | null = null,
    breadcrumb: BlogBreadcrumb = { category: null, detailPage: null },
    reviewerDoctors: BlogDoctor[] = [],
    pageProcedures: Array<{ id: string; name: string }> = [],
  ): string {
    const site = this.site
    const desc = post.summaryText ?? post.subtitle ?? ""
    const canonical = `${site.baseUrl}/${post.lang}/blog/${encodeURIComponent(post.slug)}`

    return `<!DOCTYPE html>
<html lang="${esc(post.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(post.title)} | ${esc(site.hospitalName)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(post.title)}">
<meta property="og:description" content="${esc(desc)}">
${post.thumbnailUrl ? `<meta property="og:image" content="${esc(post.thumbnailUrl)}">` : ""}
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${esc(site.hospitalName)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(post.title)}">
<meta name="twitter:description" content="${esc(desc)}">
${post.thumbnailUrl ? `<meta name="twitter:image" content="${esc(post.thumbnailUrl)}">` : ""}
${this.buildJsonLd(post, canonical, priceGroups, cfg, breadcrumb, reviewerDoctors, pageProcedures)}
<style>${TYPOGRAPHY_CSS}</style>
</head>
<body>
<header class="blog-header"><a href="${site.baseUrl}/${post.lang}/blog">${esc(site.hospitalName)} 블로그</a></header>
<main class="blog-wrap">
<article>
<h1 class="blog-title">${esc(post.title)}</h1>
${post.subtitle ? `<p class="blog-subtitle">${esc(post.subtitle)}</p>` : ""}
${post.thumbnailUrl ? `<img class="blog-thumb" src="${esc(post.thumbnailUrl)}" alt="${esc(post.title)}">` : ""}
${post.summaryText ? `<div class="blog-summary">${esc(post.summaryText)}</div>` : ""}
${this.buildToc(post.bodyHtml ?? "", post.lang)}
<div class="blog-content">${this.buildBodyWithFootnotes(post.bodyHtml ?? "", post.lang)}</div>
${this.buildAuthorCard(post)}
${this.buildPriceSection(priceGroups, post.lang)}
</article>
${this.buildRelated(post, relatedTitles)}
</main>
<footer class="blog-footer">© ${esc(site.hospitalName)}</footer>
</body>
</html>`
  }

  /**
   * 각주 — 본문 외부(출처) 링크를 위첨자 번호로 치환하고 본문 끝에 "출처" 목록 생성.
   * 프론트(blog-detail)와 동일 규칙: 외부(http) 링크=출처, 자사 도메인 제외, 같은 URL은 같은 번호로 병합.
   */
  private buildBodyWithFootnotes(bodyHtml: string, lang: string): string {
    if (!bodyHtml) return ""
    const selfHost = (() => {
      try {
        return new URL(this.site.baseUrl).hostname.replace(/^www\./, "")
      } catch {
        return ""
      }
    })()
    const $ = cheerio.load(bodyHtml, null, false)
    const numByHref = new Map<string, number>()
    const refs: Array<{ href: string; html: string }> = []
    $("a[href]").each((_, el) => {
      const href = ($(el).attr("href") ?? "").trim()
      if (!/^https?:\/\//i.test(href)) return // 내부 상대링크(관련글)는 각주 아님
      let host = ""
      try {
        host = new URL(href).hostname.replace(/^www\./, "")
      } catch {
        return
      }
      if (!host || host === selfHost) return // 자사(예약·CTA·내부 절대링크) 제외
      let n = numByHref.get(href)
      const isFirst = n === undefined
      if (isFirst) {
        n = refs.length + 1
        numByHref.set(href, n)
        const inner = ($(el).html() ?? "").trim().replace(/^\(/, "").replace(/\)$/, "").trim()
        refs.push({ href, html: inner })
      }
      const idAttr = isFirst ? ` id="cite-${n}"` : ""
      $(el).replaceWith(`<sup class="cite-ref"${idAttr}><a href="#ref-${n}">${n}</a></sup>`)
    })
    let out = $.html()
    if (refs.length) {
      const label = REF_LABEL[lang] ?? REF_LABEL.ko
      const lis = refs
        .map(
          (r, i) =>
            `<li id="ref-${i + 1}"><a href="${esc(r.href)}" target="_blank" rel="noopener noreferrer">${r.html}</a> <a href="#cite-${i + 1}" class="ref-back">↩</a></li>`,
        )
        .join("")
      out += `<section class="blog-references"><h2>${esc(label)}</h2><ol>${lis}</ol></section>`
    }
    return out
  }

  /** 목차 — 본문 H2 id 기반(h3 제외, 대제목만). 봇/검색엔진이 목차로 인식하도록 nav[aria-label] 부여 */
  private buildToc(bodyHtml: string, lang: string): string {
    if (!bodyHtml) return ""
    const $ = cheerio.load(bodyHtml, null, false)
    const items = $("h2")
      .map((_, el) => ({ id: $(el).attr("id") ?? "", text: $(el).text().trim(), lv: el.tagName.toLowerCase() }))
      .get()
      .filter((t) => t.id && t.text)
    if (items.length < 2) return ""
    const label = TOC_LABEL[lang] ?? TOC_LABEL.ko
    const lis = items
      .map((t) => `<li class="toc-${t.lv}"><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`)
      .join("")
    return `<nav class="blog-toc" aria-label="${esc(label)}"><div class="toc-title">${esc(label)}</div><ul>${lis}</ul></nav>`
  }

  /** 감수자 카드 — author_doctor */
  private buildAuthorCard(post: BlogPostV2): string {
    const d = post.authorDoctor
    if (!d) return ""
    const meta = [d.specialty, d.jobTitle].filter(Boolean).join(" · ")
    const assoc = d.associations?.length ? `<div class="ac-assoc">${esc(d.associations.join(" · "))}</div>` : ""
    return `<aside class="author-card">
${d.photoUrl ? `<img class="ac-photo" src="${esc(d.photoUrl)}" alt="${esc(d.name)}">` : `<div class="ac-photo ac-photo-empty">${esc(d.name[0] ?? "")}</div>`}
<div class="ac-body">
<div class="ac-label">의학 정보 감수</div>
<div class="ac-name">${esc(d.name)}${d.profileUrl ? "" : ""}</div>
${meta ? `<div class="ac-meta">${esc(meta)}</div>` : ""}
${assoc}
</div>
</aside>`
  }

  /** 관련 글 — internal_links. 발행된 글은 실제 제목+링크, 미발행이면 미리 적어둔 텍스트만(링크 X) */
  private buildRelated(post: BlogPostV2, relatedTitles: Record<string, string> = {}): string {
    const links = post.internalLinks
    if (!links?.length) return ""
    const lis = links
      .map((l) => {
        const title = relatedTitles[l.slug]
        return title
          ? `<li><a href="/${post.lang}/blog/${encodeURIComponent(l.slug)}">${esc(title)}</a></li>`
          : `<li><span>${esc(l.anchor)}</span></li>`
      })
      .join("")
    return `<aside class="blog-related"><h2>관련 글</h2><ul>${lis}</ul></aside>`
  }

  /** CTA 버튼 — 글별 ctaLinks(최대 2개) 우선, 없으면 사이트 공통 CTA */
  private buildCta(post: BlogPostV2): string {
    const site = this.site
    const parts: string[] = []
    if (post.ctaLinks?.length) {
      for (const c of post.ctaLinks.slice(0, 2)) {
        parts.push(`<a class="cta-btn" href="/${post.lang}${c.url}">${esc(c.text)}</a>`)
      }
    } else if (site.cta) {
      parts.push(`<a class="cta-btn" href="/${post.lang}${site.cta.url}">${esc(site.cta.text)}</a>`)
    }
    if (!parts.length) return ""
    return `<div class="blog-cta">${parts.join("")}</div>`
  }

  /**
   * 가격 섹션(봇용) — 상품명·가격을 이미지가 아닌 실제 텍스트로 출력해 크롤러가 읽게 함.
   * 상세페이지별로 구분, 각 블록 안에 가격이벤트(게시중)·전체 시술. 한쪽만 있으면 그 하나만.
   */
  private buildPriceSection(groups: BlogPriceGroup[], lang: string): string {
    try {
      return this.buildPriceSectionInner(groups, lang)
    } catch {
      // 가격 렌더 실패해도 글 SSR은 정상 — 가격 섹션만 생략
      return ""
    }
  }

  private buildPriceSectionInner(groups: BlogPriceGroup[], lang: string): string {
    if (!groups?.length) return ""
    const fmt = (n: number) => `${Number(n).toLocaleString("ko-KR")}원`
    const labelText: Record<string, string> = { POP: "event", NEW: "new", KAKAO: "kakao", BEST: "best" }
    const card = (it: BlogPriceGroup["events"][number]) => {
      const chips = (Array.isArray(it.labels) ? it.labels : [])
        .map((l) => `<span class="ps-chip">${esc(labelText[l] ?? l)}</span>`)
        .join("")
      const priceHtml = it.discountPrice
        ? `<del>${fmt(it.price)}</del> <strong>${fmt(it.discountPrice)}</strong>`
        : `<strong>${fmt(it.price)}</strong>`
      const title = it.categoryName
        ? `<span class="ps-cat">${esc(it.categoryName)}</span> ${esc(it.name)}`
        : esc(it.name)
      return `<div class="ps-card"><div class="ps-main">${chips ? `<div class="ps-chips">${chips}</div>` : ""}<div class="ps-name">${title}</div>${it.description ? `<div class="ps-desc">${esc(it.description)}</div>` : ""}</div><div class="ps-price">${priceHtml}</div></div>`
    }
    const tab = (title: string, rows: BlogPriceGroup["products"]) =>
      rows.length ? `<div class="ps-tab"><h3>${title}</h3>${rows.map(card).join("")}</div>` : ""
    const plain = (rows: BlogPriceGroup["products"]) =>
      rows.length ? `<div class="ps-tab">${rows.map(card).join("")}</div>` : ""
    const blocks = groups
      .map((g) => {
        // page=가격이벤트/전체시술 라벨 탭, category/event=라벨 없이 단일 리스트
        const inner =
          g.linkType === "page"
            ? `${tab("가격·이벤트", g.events)}${tab("전체 시술", g.products)}`
            : plain([...g.events, ...g.products])
        if (!inner) return ""
        // 더보기 링크: page=상세페이지, category=상품 대분류, event=이벤트 대분류
        const moreHref =
          g.linkType === "category"
            ? `/${esc(lang)}/products?category=${esc(g.linkId)}`
            : g.linkType === "event"
              ? `/${esc(lang)}/events?category=${esc(g.linkId)}`
              : `/${esc(lang)}/products/${esc(g.linkId)}`
        return `<section class="ps-group"><h2>${esc(g.detailPageName)} 가격</h2>${inner}<a class="ps-more" href="${moreHref}">가격 더보기</a></section>`
      })
      .filter(Boolean)
    return blocks.length ? `<aside class="blog-price">${blocks.join("")}</aside>` : ""
  }

  /** JSON-LD 풀세트: MedicalWebPage + BlogPosting + Person(작성) + Physician(감수) + MedicalClinic + Breadcrumb + FAQPage + medical_schema + 가격(Offer) */
  private buildJsonLd(
    post: BlogPostV2,
    canonical: string,
    priceGroups: BlogPriceGroup[] = [],
    cfg: BlogSiteConfig | null = null,
    breadcrumb: BlogBreadcrumb = { category: null, detailPage: null },
    reviewerDoctors: BlogDoctor[] = [],
    pageProcedures: Array<{ id: string; name: string }> = [],
  ): string {
    const site = this.site
    const graph: Record<string, unknown>[] = []
    const isoDate = (d?: Date) => (d ? new Date(d).toISOString() : undefined)
    // 병원은 한 번만 정의(@id) → publisher·provider·감수의사 소속 등은 이 id를 참조(중복 MedicalClinic 방지)
    const clinicId = `${cfg?.baseUrl || site.baseUrl}#clinic`
    // 병원 연락처·주소·이미지 — 병원 노드와 감수의사(Physician) 노드에서 공통 재사용
    const hasGeo = cfg?.latitude != null && cfg?.longitude != null
    const locality = cfg?.addressLocality || site.address?.locality
    const clinicTelephone = cfg?.telephone || undefined
    const clinicImage = site.logoUrl || undefined
    const clinicAddress = locality
      ? {
          "@type": "PostalAddress",
          streetAddress: cfg?.addressStreet || undefined,
          addressLocality: locality,
          addressRegion: cfg?.addressRegion || site.address?.region,
          postalCode: cfg?.addressPostalCode || site.address?.postalCode,
          addressCountry: cfg?.addressCountry || site.address?.country,
        }
      : undefined

    // ── @id 주소들 (페이지=canonical, 글·경로·의료진은 그 아래 조각) ──
    const pageId = canonical
    const articleId = `${canonical}#article`
    const breadcrumbId = `${canonical}#breadcrumb`
    const authorId = `${canonical}#author`
    const reviewerIdOf = (i: number, n: number) => (n === 1 ? `${canonical}#reviewer` : `${canonical}#reviewer-${i + 1}`)
    const specialty = cfg?.medicalSpecialty || "Dermatology"
    const dateOnly = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : undefined)

    // 감수 의료진: reviewer_doctors 우선, 없으면 author_doctor 폴백
    const reviewers = reviewerDoctors.length ? reviewerDoctors : post.authorDoctor ? [post.authorDoctor] : []
    const reviewerRefs = reviewers.map((_doc, i) => ({ "@id": reviewerIdOf(i, reviewers.length) }))
    const reviewedBy = reviewerRefs.length ? (reviewerRefs.length === 1 ? reviewerRefs[0] : reviewerRefs) : undefined

    // ── about(핵심 시술) 병합 ──
    //  1) 마케터 about(medical_about) 우선. 2) 옛 medical_schema가 MedicalWebPage면 껍데기는 버리고 about만 흡수(중복 방지).
    //  3) product_page 개별 시술을 name+url로 자동 추가(이름 중복 제외).
    const extraJsonld =
      post.extraJsonld && typeof post.extraJsonld === "object" ? (post.extraJsonld as Record<string, unknown>) : null
    let skipExtra = false
    const marketerAbout: Array<{ name: string; procedureType?: string; bodyLocation?: string }> = [
      ...(post.medicalAbout ?? []),
    ]
    if (extraJsonld && extraJsonld["@type"] === "MedicalWebPage") {
      skipExtra = true
      if (!marketerAbout.length && extraJsonld.about) {
        const arr = Array.isArray(extraJsonld.about) ? extraJsonld.about : [extraJsonld.about]
        for (const a of arr) {
          if (a && typeof a === "object" && (a as Record<string, unknown>).name) {
            const o = a as Record<string, unknown>
            marketerAbout.push({
              name: String(o.name),
              procedureType: o.procedureType ? String(o.procedureType) : undefined,
              bodyLocation: o.bodyLocation ? String(o.bodyLocation) : undefined,
            })
          }
        }
      }
    }
    //  이름 비교는 띄어쓰기·대소문자 무시(예: "피코라이트블랙 토닝" == "피코라이트블랙토닝") → 같은 시술은 한 항목으로 합침
    const norm = (s: string) => (s ?? "").replace(/\s+/g, "").toLowerCase()
    const aboutNodes: Array<Record<string, unknown>> = []
    const aboutByNorm = new Map<string, Record<string, unknown>>()
    for (const a of marketerAbout) {
      const nm = (a.name ?? "").trim()
      if (!nm) continue
      const key = norm(nm)
      if (aboutByNorm.has(key)) continue
      const node: Record<string, unknown> = {
        "@type": "MedicalProcedure",
        name: nm,
        procedureType: a.procedureType || undefined,
        bodyLocation: a.bodyLocation || undefined,
      }
      aboutByNorm.set(key, node)
      aboutNodes.push(node)
    }
    for (const p of pageProcedures) {
      const nm = (p.name ?? "").trim()
      if (!nm) continue
      const key = norm(nm)
      if (aboutByNorm.has(key)) continue // 마케터 about과 같은 시술 → product_page 것은 생략(마케터 표기 유지)
      const node: Record<string, unknown> = {
        "@type": "MedicalProcedure",
        name: nm,
        url: `${site.baseUrl}/${post.lang}/products/${p.id}`,
      }
      aboutByNorm.set(key, node)
      aboutNodes.push(node)
    }

    // 1. MedicalWebPage (페이지)
    graph.push({
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "@id": pageId,
      url: canonical,
      name: post.title,
      inLanguage: post.lang,
      breadcrumb: { "@id": breadcrumbId },
      mainEntity: { "@id": articleId },
      lastReviewed: dateOnly(post.updatedAt as unknown as Date),
      reviewedBy,
      medicalAudience: { "@type": "MedicalAudience", audienceType: "Patient" },
      specialty,
    })

    // 2. BlogPosting (글) — about = 마케터 핵심 시술 + product_page 개별 시술(자동 url)
    const blogPosting: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": articleId,
      headline: post.title,
      description: post.summaryText ?? post.subtitle ?? undefined,
      image: post.thumbnailUrl ?? undefined,
      datePublished: isoDate(post.publishedAt),
      dateModified: isoDate(post.updatedAt as unknown as Date),
      inLanguage: post.lang,
      isPartOf: { "@id": pageId },
      mainEntityOfPage: { "@id": pageId },
      publisher: { "@id": clinicId },
      articleSection: breadcrumb.category?.name || undefined,
    }
    if (post.authorDoctor) blogPosting.author = { "@id": authorId }
    if (reviewedBy) blogPosting.reviewedBy = reviewedBy
    if (aboutNodes.length) blogPosting.about = aboutNodes
    // 본문 외부링크 자동 수집 → citation(출처/인용)
    const citations = this.extractCitations(post.bodyHtml ?? "")
    if (citations.length > 0) {
      blogPosting.citation = citations.map((c) => ({
        "@type": "CreativeWork",
        ...(c.name ? { name: c.name } : {}),
        url: c.url,
      }))
    }
    graph.push(blogPosting)

    // 3. 작성 의료진 (Person) — author_doctor
    if (post.authorDoctor) {
      const doc = post.authorDoctor
      graph.push({
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": authorId,
        name: doc.name,
        jobTitle: doc.jobTitle ?? undefined,
        url: doc.profileUrl ?? undefined,
      })
    }
    // 4. 감수 의료진 (Physician) — reviewer_doctors. 병원 정보로 연락처·주소 채움
    reviewers.forEach((doc, i) => {
      graph.push({
        "@context": "https://schema.org",
        "@type": "Physician",
        "@id": reviewerIdOf(i, reviewers.length),
        name: doc.name,
        medicalSpecialty: doc.specialty ?? undefined,
        image: doc.photoUrl || clinicImage,
        worksFor: { "@id": clinicId },
        telephone: clinicTelephone,
        address: clinicAddress,
      })
    })

    // 2. MedicalClinic (병원) — 어드민 '기본정보'(DB) 우선, 없으면 하드코딩 설정 폴백
    graph.push({
      "@context": "https://schema.org",
      "@type": cfg?.organizationType || site.organizationType,
      "@id": clinicId,
      name: cfg?.hospitalName || site.hospitalName,
      url: cfg?.baseUrl || site.baseUrl,
      image: clinicImage,
      telephone: clinicTelephone,
      medicalSpecialty: cfg?.medicalSpecialty || undefined,
      sameAs: cfg?.sameAs?.length ? cfg.sameAs : site.sameAs,
      knowsAbout: cfg?.knowsAbout?.length ? cfg.knowsAbout : site.knowsAbout,
      address: clinicAddress,
      geo: hasGeo
        ? { "@type": "GeoCoordinates", latitude: cfg?.latitude, longitude: cfg?.longitude }
        : undefined,
    })

    // 3. BreadcrumbList — Home > Blog > (대분류) > (상세페이지) > 글
    //    대분류/상세페이지는 목록 필터 URL(?cat=&chip=)로 연결. 글 주소는 canonical 하나 그대로(중복 아님).
    const crumbs: Array<{ name: string; item: string }> = [
      { name: "Home", item: `${site.baseUrl}/${post.lang}` },
      { name: "Blog", item: `${site.baseUrl}/${post.lang}/blog` },
    ]
    if (breadcrumb.category) {
      crumbs.push({
        name: breadcrumb.category.name,
        item: `${site.baseUrl}/${post.lang}/blog?cat=${encodeURIComponent(breadcrumb.category.id)}`,
      })
    }
    if (breadcrumb.detailPage) {
      const catPart = breadcrumb.category
        ? `cat=${encodeURIComponent(breadcrumb.category.id)}&`
        : ""
      crumbs.push({
        name: breadcrumb.detailPage.name,
        item: `${site.baseUrl}/${post.lang}/blog?${catPart}chip=${encodeURIComponent(breadcrumb.detailPage.id)}`,
      })
    }
    crumbs.push({ name: post.title, item: canonical })
    graph.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.item,
      })),
    })

    // 4. FAQPage (본문 ## FAQ 파싱)
    const faqs = this.extractFaqs(post.bodyHtml ?? "")
    if (faqs.length > 0) {
      graph.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      })
    }

    // 5. medical_schema (마케터 작성) — MedicalWebPage면 자동 페이지와 중복이라 생략(about은 위에서 흡수), 그 외 타입만 그대로 삽입
    if (extraJsonld && !skipExtra) {
      graph.push(extraJsonld)
    }

    // 6. 가격(Offer) — 검색·AI가 시술 가격을 읽도록. 시술은 상품(Product)이 아니라 Service로
    //    (Product는 image·배송·반품 등 쇼핑 필드를 요구해 시술엔 부적합). Service+Offer는 이미지 불필요.
    const priceItems = priceGroups.flatMap((g) =>
      [...g.events, ...g.products].map((it) => ({
        "@type": "Service",
        name: it.name,
        description: it.description ?? undefined,
        serviceType: g.detailPageName,
        provider: { "@id": clinicId },
        offers: {
          "@type": "Offer",
          price: it.discountPrice ?? it.price,
          priceCurrency: "KRW",
          url: canonical,
        },
      })),
    )
    if (priceItems.length > 0) {
      graph.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: priceItems.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })),
      })
    }

    return graph
      .map((g) => `<script type="application/ld+json">${JSON.stringify(g).replace(/</g, "\\u003c")}</script>`)
      .join("\n")
  }

  /**
   * 본문의 외부(http) 링크를 출처/인용으로 자동 수집 → citation(CreativeWork).
   * - 상대경로(/{lang}/blog/... 내부 관련글)는 제외 (이미 "관련 글" 섹션 앵커로 처리)
   * - 자사 도메인(예약·CTA·내부 절대링크)도 제외
   * - URL 기준 중복 제거, 앵커 텍스트를 name으로 사용
   * 프론트(blog-detail) .blog-citation 판별 기준과 동일.
   */
  private extractCitations(bodyHtml: string): Array<{ url: string; name?: string }> {
    if (!bodyHtml) return []
    const selfHost = (() => {
      try {
        return new URL(this.site.baseUrl).hostname.replace(/^www\./, "")
      } catch {
        return ""
      }
    })()
    const $ = cheerio.load(bodyHtml, null, false)
    const seen = new Set<string>()
    const out: Array<{ url: string; name?: string }> = []
    $("a[href]").each((_, el) => {
      const href = ($(el).attr("href") ?? "").trim()
      if (!/^https?:\/\//i.test(href)) return // 내부 상대링크(관련글) 제외
      let host = ""
      try {
        host = new URL(href).hostname.replace(/^www\./, "")
      } catch {
        return
      }
      if (!host || host === selfHost) return // 자사(예약·CTA·내부 절대링크) 제외
      if (seen.has(href)) return
      seen.add(href)
      let name = $(el).text().trim()
      if (/^\(.*\)$/.test(name)) name = name.slice(1, -1).trim() // 전체가 괄호로 감싸진 인용만 벗김
      out.push({ url: href, name: name || undefined })
    })
    return out
  }

  /** 본문 HTML의 "## FAQ" 섹션에서 Q/A 추출 (**Q: ...** / A: ... 형식). */
  private extractFaqs(bodyHtml: string): Array<{ q: string; a: string }> {
    if (!bodyHtml) return []
    const $ = cheerio.load(bodyHtml, null, false)
    const faqs: Array<{ q: string; a: string }> = []
    const $faqH = $("h2, h3")
      .filter((_, el) => /FAQ|자주\s*묻는/i.test($(el).text()))
      .first()
    if (!$faqH.length) return faqs

    let $n = $faqH.next()
    while ($n.length && !$n.is("h2")) {
      if ($n.is("p")) {
        const $strong = $n.find("strong").first()
        const qRaw = $strong.text().trim()
        if (qRaw) {
          const full = $n.text()
          const q = qRaw.replace(/^Q[:.]?\s*/i, "").trim()
          const a = full
            .replace(qRaw, "")
            .replace(/^\s*A[:.]?\s*/i, "")
            .trim()
          if (q && a) faqs.push({ q, a })
        }
      }
      $n = $n.next()
    }
    return faqs
  }

  private render404(): string {
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>글을 찾을 수 없습니다</title></head>
<body style="font-family:sans-serif;text-align:center;padding:80px"><h1>404</h1><p>글을 찾을 수 없습니다.</p></body></html>`
  }

  private render410(): string {
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>삭제된 페이지</title></head>
<body style="font-family:sans-serif;text-align:center;padding:80px"><h1>410</h1><p>삭제된 페이지입니다.</p></body></html>`
  }
}
