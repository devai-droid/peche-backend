/**
 * PI(챗봇) facts 변환 — 순수 함수(네트워크 없음).
 * 페슈는 지점이 1개(페슈의원)라 location 1건, practitioners = blog.doctors.
 * 참고: 다른 사이트(yswclinic 등)의 pi-sync.js 매핑 규칙을 페슈 데이터에 맞게 포팅.
 *
 * 원칙(2026-10-12, PHI-874): **사이트가 원본, PI는 받아 적는 쪽.**
 *   · 사이트 값을 변형하지 않는다(직함 그대로, 빈 값도 그대로 보내 PI를 비운다).
 *   · PI에만 남는 값을 만들지 않는다(예약 링크도 사이트 주소에서 만든다).
 *   · 변경 비교는 PI가 돌려준 값과 **모양이 같은지**로 한다(jsonb는 키 순서를 바꾸므로 키를 정렬해 비교).
 */

export const PECHE_LOCATION_KEY = "peche"

export interface PiHours {
  weekly: { days: string[]; open: string; close: string; break: { start: string; end: string } | null }[]
  notes: string[]
}
/** SNS 링크 1건 — PI 계약: platform 필수, url은 http(s) 또는 null, image_url(QR 등)은 선택 */
export interface PiSnsLink {
  platform: string
  url: string | null
  image_url?: string
}
export interface PiSnsByLang {
  // 언어별 대표(공식채널 안내용) + 전체 채널. 키는 PI 언어 코드(ko·en·ja·zh-CN·zh-TW·th).
  [lang: string]: { primary: PiSnsLink | null; channels: PiSnsLink[] }
}
export interface PiLocationPayload {
  key?: string
  name: string
  address: string
  phone: string
  hours: PiHours
  sort_order?: number
  parking?: string | null
  booking_url?: string | null
  kakao_url?: string | null
  place_url?: string | null
  channel_url?: string | null
  // 위치/지도 링크
  map_links?: { naver?: string; google?: string; kakao?: string } | null
  // 공통 SNS(모든 언어 공통 노출)
  common_sns?: PiSnsLink[] | null
  // 언어별 SNS(대표 표시 포함 — 공식채널 안내는 primary만 사용)
  sns_by_lang?: PiSnsByLang | null
}
export interface PiPractitionerPayload {
  name: string
  education: string[]
  career: string[]
  gender?: string
  specialty?: string[]
  photo_url?: string | null
  /** 소개 글(pi 0073) — 챗봇 facts.md 의료진 줄에 「이름 직책 — 소개」로 실린다. 소개 글이 있는 원장 전부(대표원장 특례 없음) */
  bio?: string | null
}
export interface PiFactLocation {
  id: string
  key: string
  name?: string
  address?: string
  phone?: string
  hours?: PiHours
  [k: string]: unknown
}
export interface PiFactPractitioner {
  id: string
  key?: string
  name: string
  education?: string[]
  career?: string[]
  gender?: string
  specialty?: string[]
  photo_url?: string
  locations?: { location_key: string; position: string }[]
  [k: string]: unknown
}
export interface PiFacts {
  locations?: PiFactLocation[]
  practitioners?: PiFactPractitioner[]
}
export type PiOp =
  | { kind: "location"; action: "create" | "update"; key: string; id?: string; name: string; payload: Record<string, unknown>; reason: string }
  | {
      kind: "practitioner"
      action: "create" | "update" | "delete"
      name: string
      /** create: PI에 줄 내부 이름(사이트 의료진 고유 번호 기반 — 이름 충돌 없음) / update·delete: PI id */
      id?: string
      key?: string
      at?: string
      position?: string
      payload: Record<string, unknown>
      reason: string
    }
  | { kind: "role"; action: "set"; name: string; id?: string; at: string; position: string; reason: string }

const DAY_WEEKDAY = ["mon", "tue", "wed", "thu", "fri"]
const KO_DAY: Record<string, string> = { 월: "mon", 화: "tue", 수: "wed", 목: "thu", 금: "fri", 토: "sat", 일: "sun" }

const pad2 = (n: number) => (n < 10 ? "0" : "") + n

/** 'AM 10:30' / 'PM 21:00'(24h) / 'PM 8:00'(12h) → 'HH:MM'(24h). 페슈는 PM에 24h 숫자를 쓰기도 함. */
export function parsePecheClock(s?: string): string {
  const m = /(AM|PM)?\s*(\d{1,2}):(\d{2})/i.exec(String(s || "").trim())
  if (!m) return ""
  const ap = m[1] ? m[1].toUpperCase() : ""
  let h = parseInt(m[2], 10)
  const mm = m[3]
  if (ap === "AM" && h === 12) h = 0
  else if (ap === "PM" && h < 12) h += 12
  return pad2(h) + ":" + mm
}
/** 'AM 10:30 ~ PM 21:00' → {open,close} */
export function parseRange(s?: string): { open: string; close: string } {
  const parts = String(s || "").split("~")
  return { open: parsePecheClock(parts[0]), close: parsePecheClock(parts[1]) }
}
/** '평일'/'주말·공휴일'/'월, 수' → day 코드 배열 */
export function parseDaysLabel(label?: string): string[] {
  const lab = String(label || "").replace(/요일/g, "").trim()
  if (/평일/.test(lab)) return [...DAY_WEEKDAY]
  const out: string[] = []
  lab.split(/[,·・/]/).forEach((raw) => {
    const p = raw.trim()
    if (!p) return
    if (p === "주말") {
      out.push("sat", "sun")
    } else if (p === "공휴일" || p === "공휴") out.push("pub")
    else if (KO_DAY[p]) out.push(KO_DAY[p])
  })
  return Array.from(new Set(out))
}

/** '평일 : AM 10:30 ~ PM 21:00' → {label,range} (첫 콜론으로 분리; 시간의 콜론은 label에 콜론이 없으므로 안전) */
function splitHourLine(line?: string): { label: string; range: string } | null {
  const s = String(line || "").trim()
  if (!s) return null
  const i = s.indexOf(":")
  if (i < 0) return null
  return { label: s.slice(0, i).trim(), range: s.slice(i + 1).trim() }
}

/** <br>·줄머리 '*'·'※' 제거해 한 문장으로 */
export function cleanText(s?: string): string {
  if (!s) return ""
  return String(s)
    .split(/<br\s*\/?>|\n/i)
    .map((l) => l.replace(/^[\s*※\-·]+/, "").trim())
    .filter(Boolean)
    .join(" ")
    .trim()
}

/** 페슈 진료시간(weekday/weekend/lunch 문자열) → PI hours 구조 */
export function pecheHoursToPI(cfg: {
  weekdayHours?: string
  weekendHours?: string
  lunchInfo?: string
}): PiHours {
  const weekly: PiHours["weekly"] = []
  for (const line of [cfg.weekdayHours, cfg.weekendHours]) {
    const parsed = splitHourLine(line)
    if (!parsed) continue
    const days = parseDaysLabel(parsed.label)
    const r = parseRange(parsed.range)
    if (!days.length || !r.open || !r.close) continue
    weekly.push({ days, open: r.open, close: r.close, break: null })
  }
  const notes: string[] = []
  const lunch = cleanText(cfg.lunchInfo)
  if (lunch) notes.push(lunch)
  return { weekly, notes }
}

/** 직책: 사이트에 적힌 그대로(변형 없음). 비어 있으면 '원장'. */
export function piPosition(jobTitle?: string): string {
  return String(jobTitle || "").trim() || "원장"
}

/** 사이트 주소 → 챗봇 예약 카드가 쓰는 예약 페이지(사이트 라우트 `/ko/reservation/new` — 언어 접두 없는 주소는 홈으로 간다). */
export function bookingUrlOf(baseUrl?: string): string | null {
  const b = String(baseUrl || "")
    .trim()
    .replace(/\/+$/, "")
  return /^https?:\/\//.test(b) ? `${b}/ko/reservation/new` : null
}

/** 신규 의료진의 PI 내부 이름 — 사이트 의료진 고유 번호(uuid) 기반. 이름 글자 기반은 두 글자가 같으면 충돌했다. */
export function piPractitionerKey(doctorId: string): string {
  return "doc-" + String(doctorId || "").toLowerCase().replace(/[^a-z0-9._-]/g, "")
}

// ---- diff ----
/**
 * 값을 비교용 문자열로. null·undefined·''·[]·{}는 전부 빈 값(''), 객체는 키를 정렬해 직렬화
 * (PI는 jsonb로 저장해 키 순서가 바뀌어 돌아온다). hours의 days도 정렬.
 */
export function canon(v: unknown): string {
  if (v == null || v === "") return ""
  if (Array.isArray(v)) {
    if (v.length === 0) return ""
    return "[" + v.map(canon).join(",") + "]"
  }
  if (typeof v === "object") {
    const keys = Object.keys(v as Record<string, unknown>).sort()
    const parts: string[] = []
    for (const k of keys) {
      const c = canon((v as Record<string, unknown>)[k])
      if (c !== "") parts.push(JSON.stringify(k) + ":" + c)
    }
    return parts.length ? "{" + parts.join(",") + "}" : ""
  }
  return JSON.stringify(String(v))
}
function canonHours(h?: PiHours): string {
  const hh = h || { weekly: [], notes: [] }
  const wk = (hh.weekly || []).map((w) => ({
    days: (w.days || []).slice().sort(),
    open: w.open || "",
    close: w.close || "",
    break: w.break ? { start: w.break.start, end: w.break.end } : null,
  }))
  return canon({ weekly: wk, notes: (hh.notes || []).slice() })
}

/**
 * 보낼 payload: 키 목록의 값을 전부 담는다. 빈 값은 null(= PI를 비운다 — PI에만 남는 값을 만들지 않는다).
 * arrayKeys(PI가 배열만 받는 칸 — 의료진 학력·경력·전문분야)는 빈 값을 []로.
 */
export function toUpdatePayload(payload: Record<string, unknown>, keys: string[], arrayKeys: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  keys.forEach((k) => {
    const v = payload[k]
    out[k] = canon(v) === "" ? (arrayKeys.includes(k) ? [] : null) : v
  })
  return out
}
export const LOC_KEYS = [
  "name",
  "address",
  "phone",
  "hours",
  "sort_order",
  "parking",
  "booking_url",
  "place_url",
  "kakao_url",
  "channel_url",
  "map_links",
  "common_sns",
  "sns_by_lang",
]
export const PRAC_KEYS = ["name", "education", "career", "specialty", "photo_url", "bio"]
export const PRAC_ARRAY_KEYS = ["education", "career", "specialty"]

function locChanged(payload: Record<string, unknown>, piLoc: PiFactLocation): boolean {
  for (const k of LOC_KEYS) {
    if (k === "hours") {
      if (canonHours(payload.hours as PiHours) !== canonHours(piLoc.hours)) return true
      continue
    }
    if (canon(payload[k]) !== canon((piLoc as Record<string, unknown>)[k])) return true
  }
  return false
}
function pracChanged(payload: Record<string, unknown>, piPrac: PiFactPractitioner): boolean {
  for (const k of PRAC_KEYS) {
    if (canon(payload[k]) !== canon((piPrac as Record<string, unknown>)[k])) return true
  }
  return false
}
export const nfc = (s: unknown): string => {
  try {
    return String(s == null ? "" : s).normalize("NFC")
  } catch {
    return String(s == null ? "" : s)
  }
}

export interface SyncDoctor {
  /** 사이트 의료진 고유 번호 — 신규 의료진의 PI 내부 이름 재료 */
  id: string
  name: string
  jobTitle?: string
  specialty?: string
  photoUrl?: string
  bio?: string
}

/** 페슈(지점1 + 의료진) vs PI facts → 작업 목록. 순수 함수. 삭제는 warning만. */
export function planSync(
  location: PiLocationPayload,
  doctors: SyncDoctor[],
  facts: PiFacts,
): { ops: PiOp[]; warnings: { type: string; name: string; note: string }[] } {
  const ops: PiOp[] = []
  const warnings: { type: string; name: string; note: string }[] = []
  const locKey = location.key || PECHE_LOCATION_KEY
  const piLocs = facts.locations || []
  const piPracByName: Record<string, PiFactPractitioner[]> = {}
  ;(facts.practitioners || []).forEach((p) => {
    const k = nfc(p.name)
    ;(piPracByName[k] = piPracByName[k] || []).push(p)
  })

  // 지점
  const locPayload: Record<string, unknown> = { ...location, sort_order: 0 }
  const piLoc = piLocs.find((l) => l.key === locKey)
  if (!piLoc) {
    ops.push({
      kind: "location",
      action: "create",
      key: locKey,
      name: location.name,
      payload: { key: locKey, ...toUpdatePayload(locPayload, LOC_KEYS) },
      reason: "신규 지점",
    })
  } else if (locChanged(locPayload, piLoc)) {
    ops.push({
      kind: "location",
      action: "update",
      key: locKey,
      id: piLoc.id,
      name: location.name,
      payload: toUpdatePayload(locPayload, LOC_KEYS),
      reason: "지점 정보 변경",
    })
  }

  // 의료진
  const siteNames: Record<string, boolean> = {}
  doctors.forEach((d) => {
    if (!d.name) return
    siteNames[nfc(d.name)] = true
    const ppay: Record<string, unknown> = {
      name: String(d.name).trim(),
      education: [],
      career: [],
      specialty: d.specialty ? [String(d.specialty).trim()] : [],
      photo_url: d.photoUrl ? String(d.photoUrl) : null,
      bio: d.bio && String(d.bio).trim() ? String(d.bio).trim() : null,
    }
    const position = piPosition(d.jobTitle)
    const cand = (piPracByName[nfc(d.name)] || [])[0]
    if (!cand) {
      ops.push({
        kind: "practitioner",
        action: "create",
        name: d.name,
        key: piPractitionerKey(d.id),
        at: locKey,
        position,
        payload: toUpdatePayload(ppay, PRAC_KEYS, PRAC_ARRAY_KEYS),
        reason: "신규 의료진",
      })
    } else {
      if (pracChanged(ppay, cand))
        ops.push({
          kind: "practitioner",
          action: "update",
          name: d.name,
          id: cand.id,
          payload: toUpdatePayload(ppay, PRAC_KEYS, PRAC_ARRAY_KEYS),
          reason: "의료진 정보 변경",
        })
      const role = (cand.locations || []).find((x) => x.location_key === locKey)
      if (!role)
        ops.push({ kind: "role", action: "set", name: d.name, id: cand.id, at: locKey, position, reason: "지점 배치 추가" })
      else if (role.position !== position)
        ops.push({ kind: "role", action: "set", name: d.name, id: cand.id, at: locKey, position, reason: "직책 변경" })
    }
  })

  // PI에만 있고 사이트에 없는 의료진 → 자동 삭제(사이트 데이터 최우선).
  // 숨김(isVisible=false)은 애초에 doctors에 없으므로 여기서 자동으로 삭제 대상이 됨.
  // 안전장치: 사이트 의료진이 0명이면(조회 오류 등) 전부 지우는 사고를 막기 위해 삭제 안 함.
  if (doctors.length > 0) {
    ;(facts.practitioners || []).forEach((p) => {
      if (!siteNames[nfc(p.name)]) {
        ops.push({
          kind: "practitioner",
          action: "delete",
          name: p.name,
          id: p.id,
          payload: {},
          reason: "사이트에 없음 — 자동 삭제",
        })
      }
    })
  } else {
    ;(facts.practitioners || []).forEach((p) => {
      warnings.push({ type: "skip-delete", name: p.name, note: "사이트 의료진 0명이라 삭제 보류(안전장치)" })
    })
  }

  return { ops, warnings }
}

// ---- 언어 코드 ----
/** 사이트 내부 언어 코드 → PI 언어 코드(챗봇이 요청마다 받는 값과 같은 표기 — 간체는 zh-CN). */
export const PI_LANG_OF_SITE: Record<string, string> = {
  ko: "ko",
  en: "en",
  zh: "zh-CN",
  ja: "ja",
  th: "th",
  "zh-TW": "zh-TW",
}
/** 사이트 언어 코드 → PI 언어 코드. 목록에 없는 언어는 null(보내지 않는다). */
export function piLangOf(siteLang?: string): string | null {
  return PI_LANG_OF_SITE[String(siteLang || "")] ?? null
}

// ---- 예약 설정(booking-settings) ----
/** 예약 안내 문구를 읽을 행 모양 — 기본(site_config)·언어별(site_config_i18n) 공통 */
export interface ReservationNoticeSource {
  reservationNotice?: string | null
  reservationNoticeEnabled?: boolean | null
}
/** PI 예약 설정 — 지금은 reservation_notice만 본다(PI가 칸을 늘려도 모르는 키는 무시). */
export interface PiBookingSettings {
  reservation_notice: Record<string, string> | null
}

// ---- 언어별 표시값 병합(사이트 getMerged와 같은 규칙) ----
/** 언어별 행의 값이 기본(ko) 값을 덮는가 — 배열은 1개 이상, 그 밖은 null·빈 문자열이 아닐 때(false는 덮는다). */
export function overridesBase(v: unknown): boolean {
  return Array.isArray(v) ? v.length > 0 : v != null && v !== ""
}
/**
 * 기본(공통+ko) 행 + 언어별 행 → 그 언어의 표시값. 사이트 공개 화면(BlogSiteConfigService.getMerged)이 이 함수를 쓴다.
 * 언어별 행이 없으면 기본 행 그대로.
 */
export function mergeLocalized<B extends object>(base: B, i18n: object | null | undefined, keys: readonly string[]): B {
  if (!i18n) return base
  const merged = { ...base } as Record<string, unknown>
  for (const k of keys) {
    const v = (i18n as Record<string, unknown>)[k]
    if (overridesBase(v)) merged[k] = v
  }
  return merged as B
}

const NOTICE_KEYS = ["reservationNotice", "reservationNoticeEnabled"] as const

/**
 * 예약 안내 문구 → PI reservation_notice. 사이트 예약 화면과 같은 판정:
 *   · 대상 언어 = 사이트 언어 목록(PI_LANG_OF_SITE, ko 포함). 키는 PI 언어 코드(zh→zh-CN).
 *   · 언어마다 getMerged와 같은 병합(mergeLocalized) — 언어별 enabled·문구가 비어 있으면(null·'') 기본(ko) 값을 따른다.
 *     ko는 기본 행 그대로(언어별 ko 행은 화면에서도 안 쓴다).
 *   · 병합 결과가 켜져 있고 문구가 trim 뒤 비어 있지 않으면 담는다(언어별 행이 없는 언어도 기본이 켜져 있으면 ko 문구).
 *   · 담을 언어가 없으면 null(= PI에서 지운다).
 */
export function reservationNoticeOf(
  base: ReservationNoticeSource | null | undefined,
  i18nRows: (ReservationNoticeSource & { lang: string })[],
): Record<string, string> | null {
  const out: Record<string, string> = {}
  const baseRow: ReservationNoticeSource = base || {}
  for (const [siteLang, piLang] of Object.entries(PI_LANG_OF_SITE)) {
    const row = siteLang === "ko" ? null : (i18nRows || []).find((r) => r.lang === siteLang)
    const m = mergeLocalized(baseRow, row, NOTICE_KEYS)
    const text = String(m.reservationNotice ?? "").trim()
    if (m.reservationNoticeEnabled && text) out[piLang] = text
  }
  return Object.keys(out).length ? out : null
}

/** PI가 돌려준 예약 설정과 보낼 값이 다른가 — canon 비교(키 순서 무시·null과 {}는 같음). */
export function bookingSettingsChanged(
  local: PiBookingSettings,
  pi: Partial<PiBookingSettings> | null | undefined,
): boolean {
  return canon(local.reservation_notice) !== canon(pi?.reservation_notice)
}
