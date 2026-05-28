import { Injectable } from "@nestjs/common"
import * as cheerio from "cheerio"
import { BlogV2PostService } from "@root/blog-v2/services/blog-v2-post.service"
import { BlogPostV2 } from "@root/blog-v2/entities/post.entity"
import { PECHE_SITE, SiteConfig } from "@root/blog-v2/sites/peche.config"

function esc(s?: string): string {
  if (!s) return ""
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
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
  .blog-cta{margin:40px 0 0;text-align:center}
  .cta-btn{display:inline-block;background:#DA7F67;color:#fff;padding:14px 36px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px}
  .cta-btn:hover{background:#c56b54}
  .blog-footer{border-top:1px solid #eee;padding:32px 24px;text-align:center;color:#999;font-size:13px}
`

@Injectable()
export class BlogRenderService {
  private readonly site: SiteConfig = PECHE_SITE

  constructor(private readonly postService: BlogV2PostService) {}

  async renderPostPage(slug: string, lang: string): Promise<{ html: string; status: number }> {
    const post = await this.postService.findBySlug(slug, lang)
    if (!post) return { html: this.render404(), status: 404 }
    return { html: this.buildHtml(post), status: 200 }
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

  private buildHtml(post: BlogPostV2): string {
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
${post.mainKeyword ? `<meta name="keywords" content="${esc([post.mainKeyword, ...(post.subKeywords ?? [])].join(", "))}">` : ""}
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
${this.buildJsonLd(post, canonical)}
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
${this.buildToc(post.bodyHtml ?? "")}
<div class="blog-content">${post.bodyHtml ?? ""}</div>
${this.buildAuthorCard(post)}
</article>
${this.buildRelated(post)}
${this.buildCta(post)}
</main>
<footer class="blog-footer">© ${esc(site.hospitalName)}</footer>
</body>
</html>`
  }

  /** 목차 — 본문 H2/H3 id 기반 */
  private buildToc(bodyHtml: string): string {
    if (!bodyHtml) return ""
    const $ = cheerio.load(bodyHtml, null, false)
    const items = $("h2, h3")
      .map((_, el) => ({ id: $(el).attr("id") ?? "", text: $(el).text().trim(), lv: el.tagName.toLowerCase() }))
      .get()
      .filter((t) => t.id && t.text)
    if (items.length < 2) return ""
    const lis = items
      .map((t) => `<li class="toc-${t.lv}"><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`)
      .join("")
    return `<nav class="blog-toc"><div class="toc-title">목차</div><ul>${lis}</ul></nav>`
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

  /** 관련 글 — internal_links */
  private buildRelated(post: BlogPostV2): string {
    const links = post.internalLinks
    if (!links?.length) return ""
    const lis = links
      .map((l) => `<li><a href="/${post.lang}/blog/${encodeURIComponent(l.slug)}">${esc(l.anchor)}</a></li>`)
      .join("")
    return `<aside class="blog-related"><h2>관련 글</h2><ul>${lis}</ul></aside>`
  }

  /** 시술 대분류 카드 + 공통 CTA */
  private buildCta(post: BlogPostV2): string {
    const site = this.site
    const parts: string[] = []
    if (site.cta) {
      parts.push(`<a class="cta-btn" href="/${post.lang}${site.cta.url}">${esc(site.cta.text)}</a>`)
    }
    if (!parts.length) return ""
    return `<div class="blog-cta">${parts.join("")}</div>`
  }

  /** JSON-LD 풀세트: BlogPosting + MedicalClinic + Physician(reviewedBy) + Breadcrumb + FAQPage + medical_schema */
  private buildJsonLd(post: BlogPostV2, canonical: string): string {
    const site = this.site
    const graph: Record<string, unknown>[] = []
    const isoDate = (d?: Date) => (d ? new Date(d).toISOString() : undefined)

    // 1. BlogPosting (+ author/reviewedBy = 감수의사)
    const blogPosting: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summaryText ?? post.subtitle ?? undefined,
      image: post.thumbnailUrl ?? undefined,
      datePublished: isoDate(post.publishedAt),
      dateModified: isoDate(post.updatedAt as unknown as Date),
      mainEntityOfPage: { "@type": "MedicalWebPage", "@id": canonical },
      publisher: { "@type": site.organizationType, name: site.hospitalName },
    }
    if (post.authorDoctor) {
      const doc = post.authorDoctor
      blogPosting.author = {
        "@type": "Person",
        name: doc.name,
        jobTitle: doc.jobTitle ?? undefined,
        url: doc.profileUrl ?? undefined,
      }
      blogPosting.reviewedBy = {
        "@type": "Physician",
        name: doc.name,
        medicalSpecialty: doc.specialty ?? undefined,
      }
    }
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

    // 2. MedicalClinic (병원)
    graph.push({
      "@context": "https://schema.org",
      "@type": site.organizationType,
      name: site.hospitalName,
      url: site.baseUrl,
      sameAs: site.sameAs,
      knowsAbout: site.knowsAbout,
      address: site.address
        ? {
            "@type": "PostalAddress",
            addressLocality: site.address.locality,
            addressRegion: site.address.region,
            postalCode: site.address.postalCode,
            addressCountry: site.address.country,
          }
        : undefined,
    })

    // 3. BreadcrumbList
    graph.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.baseUrl}/${post.lang}` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${site.baseUrl}/${post.lang}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: canonical },
      ],
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

    // 5. medical_schema (글 주인공 JSON-LD, 마케터 작성)
    if (post.extraJsonld && typeof post.extraJsonld === "object") {
      graph.push(post.extraJsonld as Record<string, unknown>)
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
}
