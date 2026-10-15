/**
 * PI(챗봇) 시술·이벤트 카탈로그 변환 — 순수 함수(네트워크 없음). PHI-874 후속 · pi 홈페이지 사실 연동 정리 2단계(2026-10-16).
 *
 * 홈페이지 상품·분류·상세페이지·이벤트 번들을 pi `PUT /api/orgs/{org}/catalog`(전체 교체) 본문으로 옮긴다.
 * 대응표의 정본은 pi 쪽 참조 구현(`workers/lib/catalogOfSite.ts`)과 같다 — 여기서 바꾸면 거기도 같이 바뀌어야 한다.
 *
 * 원칙(사이트가 원본, PI는 받아 적는 쪽):
 *   · 값을 변형하지 않는다 — 이름·가격·안내·라벨·순서·노출을 그대로. 단 pi가 저장 때 이름의 연속 공백·줄바꿈을 공백 하나로 접으므로
 *     변경 비교는 같은 정리를 건 뒤 한다(안 그러면 매번 「바뀜」으로 보여 빈 PUT이 나간다 — pi는 changed:false로 답하지만 왕복 낭비).
 *   · key = 병원 접두 `peche-` + 사이트 고유 번호(시술 표는 전 병원 공유라 key가 전역에서 유일해야 한다).
 *       분류 `peche-cat-<id>` · 상세페이지 `peche-dp-<id>` · 상품 `peche-<id>` · 번들 `peche-b-<id>` · 이벤트 `peche-e-<id>`
 *   · 번들은 게시 기간과 무관하게 **전부** 보낸다 — 오늘 게시 중인지는 pi가 답할 때 날짜로 판정한다(저장 없이도 게시 시작·종료가 반영되게).
 *   · 상품이 가리키지만 분류 목록(ACTIVE)에 없는 분류·상세페이지는 그 이름으로 묶음을 만들어 준다(챗봇 본문에서 「기타」로 뭉개지지 않게).
 */

export const PECHE_CATALOG_PREFIX = "peche-"

/** 사이트 다국어 컬럼 접미 → pi 언어 코드(ko는 name 자체라 제외) */
const NAME_SUFFIX: Record<string, string> = { EN: "en", ZH: "zh-CN", ZHTW: "zh-TW", JA: "ja", TH: "th" }

export interface PiCatalogGroup {
  key: string
  name: string
  names: Record<string, string>
  parent_key: string | null
  site_ref: string | null
  sort_order: number | null
}
export interface PiCatalogService {
  key: string
  name: string
  names: Record<string, string>
  group_key: string | null
  site_ref: string | null
  visible: boolean
  sort_order: number | null
  facts: Record<string, string>
}
export interface PiCatalogEvent {
  key: string
  name: string
  names: Record<string, string>
  price: number
  discount_price: number | null
  labels: string[]
  group_name: string | null
  description: string | null
  site_ref: string | null
  visible: boolean
  sort_order: number | null
}
export interface PiCatalogBundle {
  key: string
  name: string
  start_date: string
  end_date: string
  post_start_date: string | null
  post_end_date: string | null
  site_ref: string | null
  sort_order: number | null
  events: PiCatalogEvent[]
}
export interface PiCatalog {
  groups: PiCatalogGroup[]
  services: PiCatalogService[]
  bundles: PiCatalogBundle[]
}

/** 사이트 행에서 읽는 최소 모양(엔티티 공용 — 테스트는 평범한 객체로 만든다) */
export interface NamedRow {
  name?: string | null
  nameEN?: string | null
  nameZH?: string | null
  nameZHTW?: string | null
  nameJA?: string | null
  nameTH?: string | null
}
export interface CategoryRow extends NamedRow {
  id: string
  status?: string | null
  order?: number | null
  detailPages?: DetailPageRow[] | null
}
export interface DetailPageRow extends NamedRow {
  id: string
  status?: string | null
  order?: number | null
  categoryId?: string | null
  category?: { id: string } | null
}
export interface ProductRow extends NamedRow {
  id: string
  price: number
  discountPrice?: number | null
  description?: string | null
  order?: number | null
  visible?: boolean | null
  category?: (NamedRow & { id: string }) | null
  detailPage?: (NamedRow & { id: string }) | null
}
export interface EventRow extends NamedRow {
  id: string
  price: number
  discountPrice?: number | null
  description?: string | null
  order?: number | null
  visible?: boolean | null
  label?: string[] | null
  category?: NamedRow | null
  detailPage?: NamedRow | null
}
export interface BundleRow {
  id: string
  name?: string | null
  startDate: Date | string
  endDate: Date | string
  postStartDate?: Date | string | null
  postEndDate?: Date | string | null
  order?: number | null
  events?: EventRow[] | null
}

/** pi의 이름 정리와 같은 규칙(연속 공백·줄바꿈 → 공백 하나, 앞뒤 공백 제거). 비교·전송 모두 이 값으로. */
export const tidy = (v: unknown): string =>
  String(v == null ? "" : v)
    .replace(/\s+/g, " ")
    .trim()
/** pi의 항목 값 정규화(줄 단위로 공백 정리, 줄바꿈은 보존). 안내문 비교용. */
export const tidyValue = (v: unknown): string =>
  String(v == null ? "" : v)
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .trim()
const slug = (id: string): string =>
  String(id || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")

/** 한국 날짜(YYYY-MM-DD) — 번들 기간은 어드민이 날짜만 고르지만 저장 시 시각이 붙는다(kst.helper와 같은 전제). */
export function kstDate(d: Date | string | null | undefined): string | null {
  if (!d) return null
  const t = d instanceof Date ? d.getTime() : new Date(d).getTime()
  if (!Number.isFinite(t)) return null
  return new Date(t + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function namesOf(r: NamedRow): Record<string, string> {
  const out: Record<string, string> = {}
  const base = tidy(r.name)
  for (const [suffix, lang] of Object.entries(NAME_SUFFIX)) {
    const v = tidy((r as Record<string, unknown>)[`name${suffix}`])
    if (v && v !== base) out[lang] = v
  }
  return out
}

const isActive = (status?: string | null): boolean => (status ?? "ACTIVE") === "ACTIVE"
const byOrder = <T extends { order?: number | null; name?: string | null }>(a: T, b: T): number =>
  (a.order ?? 9999) - (b.order ?? 9999) || tidy(a.name).localeCompare(tidy(b.name), "ko")

export interface CatalogSource {
  categories: CategoryRow[]
  products: ProductRow[]
  bundles: BundleRow[]
}

/** 사이트 행 → pi 카탈로그 본문. */
export function catalogOf(src: CatalogSource, prefix = PECHE_CATALOG_PREFIX): PiCatalog {
  const catKey = (id: string) => `${prefix}cat-${slug(id)}`
  const pageKey = (id: string) => `${prefix}dp-${slug(id)}`

  const groups: PiCatalogGroup[] = []
  const seen = new Set<string>()
  const addGroup = (g: PiCatalogGroup) => {
    if (seen.has(g.key)) return
    seen.add(g.key)
    groups.push(g)
  }
  const categories = (src.categories || []).filter((c) => isActive(c.status)).slice().sort(byOrder)
  for (const c of categories) {
    addGroup({ key: catKey(c.id), name: tidy(c.name), names: namesOf(c), parent_key: null, site_ref: c.id, sort_order: c.order ?? null })
    const pages = (c.detailPages || []).filter((d) => isActive(d.status)).slice().sort(byOrder)
    for (const d of pages) {
      addGroup({ key: pageKey(d.id), name: tidy(d.name), names: namesOf(d), parent_key: catKey(c.id), site_ref: d.id, sort_order: d.order ?? null })
    }
  }
  const products = (src.products || []).slice().sort(byOrder)
  for (const p of products) {
    if (p.category?.id && !seen.has(catKey(p.category.id))) {
      addGroup({ key: catKey(p.category.id), name: tidy(p.category.name) || "기타", names: {}, parent_key: null, site_ref: p.category.id, sort_order: 9998 })
    }
    if (p.detailPage?.id && !seen.has(pageKey(p.detailPage.id))) {
      addGroup({
        key: pageKey(p.detailPage.id),
        name: tidy(p.detailPage.name),
        names: {},
        parent_key: p.category?.id ? catKey(p.category.id) : null,
        site_ref: p.detailPage.id,
        sort_order: 9999,
      })
    }
  }

  const services: PiCatalogService[] = products.map((p) => {
    const facts: Record<string, string> = { price: String(Math.round(p.price ?? 0)) }
    if (p.discountPrice != null) facts.discount_price = String(Math.round(p.discountPrice))
    const notice = tidyValue(p.description)
    if (notice) facts.notice = notice
    return {
      key: `${prefix}${slug(p.id)}`,
      name: tidy(p.name),
      names: namesOf(p),
      group_key: p.detailPage?.id ? pageKey(p.detailPage.id) : p.category?.id ? catKey(p.category.id) : null,
      site_ref: p.id,
      visible: p.visible === true,
      sort_order: p.order ?? null,
      facts,
    }
  })

  const bundles: PiCatalogBundle[] = (src.bundles || [])
    .slice()
    .sort(byOrder)
    .map((b) => ({
      key: `${prefix}b-${slug(b.id)}`,
      name: tidy(b.name),
      start_date: kstDate(b.startDate) || "",
      end_date: kstDate(b.endDate) || "",
      post_start_date: kstDate(b.postStartDate),
      post_end_date: kstDate(b.postEndDate),
      site_ref: b.id,
      sort_order: b.order ?? null,
      events: (b.events || [])
        .slice()
        .sort(byOrder)
        .map((e) => ({
          key: `${prefix}e-${slug(e.id)}`,
          name: tidy(e.name),
          names: namesOf(e),
          price: Math.round(e.price ?? 0),
          discount_price: e.discountPrice != null ? Math.round(e.discountPrice) : null,
          labels: (e.label || []).map(String),
          group_name: tidy(e.detailPage?.name) || tidy(e.category?.name) || null,
          description: tidyValue(e.description) || null,
          site_ref: e.id,
          visible: e.visible === true,
          sort_order: e.order ?? null,
        })),
    }))

  return { groups, services, bundles }
}

// ---- 비교 ----
/** 정규형(순서 무시) — pi `canonicalCatalog`와 같은 규칙: 배열은 key 순, 객체 키는 이름 순. */
export function canonicalCatalog(c: Partial<PiCatalog> | null | undefined): PiCatalog {
  const sortObj = (o: Record<string, unknown> | null | undefined): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(o || {})
        .filter(([, v]) => v != null && v !== "")
        .sort(([a], [b]) => a.localeCompare(b)),
    )
  const byKey = <T extends { key: string }>(xs: readonly T[] | null | undefined): T[] =>
    (xs || []).slice().sort((a, b) => a.key.localeCompare(b.key))
  return {
    groups: byKey(c?.groups).map((g) => ({ ...g, names: sortObj(g.names) as Record<string, string> })),
    services: byKey(c?.services).map((s) => ({
      ...s,
      names: sortObj(s.names) as Record<string, string>,
      facts: sortObj(s.facts as Record<string, unknown>) as Record<string, string>,
    })),
    bundles: byKey(c?.bundles).map((b) => ({
      ...b,
      events: byKey(b.events).map((e) => ({ ...e, names: sortObj(e.names) as Record<string, string>, labels: (e.labels || []).slice() })),
    })),
  }
}

/** 보낼 값과 pi가 돌려준 값이 다른가(null·빈 값·키 순서 무시). */
export function catalogChanged(local: PiCatalog, pi: Partial<PiCatalog> | null | undefined): boolean {
  return canonText(canonicalCatalog(local)) !== canonText(canonicalCatalog(pi))
}

// pi-sync.util.canon과 같은 규칙(빈 값=''·키 정렬)을 카탈로그에 적용.
function canonText(v: unknown): string {
  if (v == null || v === "") return ""
  if (Array.isArray(v)) return "[" + v.map(canonText).join(",") + "]"
  if (typeof v === "object") {
    const parts: string[] = []
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      const c = canonText((v as Record<string, unknown>)[k])
      if (c !== "") parts.push(JSON.stringify(k) + ":" + c)
    }
    return parts.length ? "{" + parts.join(",") + "}" : ""
  }
  if (typeof v === "boolean") return v ? "true" : "false" // 양쪽 다 이 함수를 타므로 false와 없음이 구분된다(visible=false ≠ 생략)
  return JSON.stringify(String(v))
}

export function catalogCounts(c: PiCatalog): { groups: number; services: number; bundles: number; events: number } {
  return {
    groups: c.groups.length,
    services: c.services.length,
    bundles: c.bundles.length,
    events: c.bundles.reduce((n, b) => n + b.events.length, 0),
  }
}
