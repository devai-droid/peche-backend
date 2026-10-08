/**
 * PI(챗봇) facts 변환 — 순수 함수(네트워크 없음).
 * 페슈는 지점이 1개(페슈의원)라 location 1건, practitioners = blog.doctors.
 * 참고: 다른 사이트(yswclinic 등)의 pi-sync.js 매핑 규칙을 페슈 데이터에 맞게 포팅.
 */

export const PECHE_LOCATION_KEY = "peche"

export interface PiHours {
  weekly: { days: string[]; open: string; close: string; break: { start: string; end: string } | null }[]
  notes: string[]
}
export interface PiSnsLink {
  platform: string
  url: string
}
export interface PiSnsByLang {
  // 언어별 대표(공식채널 안내용) + 전체 채널
  [lang: string]: { primary: PiSnsLink | null; channels: PiSnsLink[] }
}
export interface PiLocationPayload {
  key?: string
  name: string
  address: string
  phone: string
  hours: PiHours
  sort_order?: number
  parking?: string
  booking_url?: string
  kakao_url?: string
  place_url?: string
  channel_url?: string
  // 위치/지도 링크
  map_links?: { naver?: string; google?: string; kakao?: string }
  // 공통 SNS(모든 언어 공통 노출)
  common_sns?: PiSnsLink[]
  // 언어별 SNS(대표 표시 포함 — 공식채널 안내는 primary만 사용)
  sns_by_lang?: PiSnsByLang
}
export interface PiPractitionerPayload {
  name: string
  education: string[]
  career: string[]
  gender?: string
  specialty?: string[]
  photo_url?: string
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
  | { kind: "practitioner"; action: "create" | "update"; name: string; id?: string; at?: string; position?: string; payload: Record<string, unknown>; reason: string }
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

/** 직책 → PI 규격(대표 포함=대표원장, 그 외=진료원장) */
export function piPosition(jobTitle?: string): string {
  return /대표/.test(String(jobTitle || "")) ? "대표원장" : "진료원장"
}

// ---- diff ----
function canonHours(h?: PiHours): string {
  const hh = h || { weekly: [], notes: [] }
  const wk = (hh.weekly || []).map((w) => ({
    days: (w.days || []).slice().sort(),
    open: w.open || "",
    close: w.close || "",
    break: w.break ? { start: w.break.start, end: w.break.end } : null,
  }))
  return JSON.stringify({ weekly: wk, notes: (hh.notes || []).slice() })
}
function isEmpty(v: unknown): boolean {
  return v == null || v === "" || (Array.isArray(v) && v.length === 0)
}
/** 필수 키는 항상, 선택 키는 값 있을 때만 포함(빈 값으로 PI를 덮지 않음) */
export function pruneUpdate(
  payload: Record<string, unknown>,
  alwaysKeys: string[],
  optKeys: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  alwaysKeys.forEach((k) => {
    if (k in payload) out[k] = payload[k]
  })
  optKeys.forEach((k) => {
    if (!isEmpty(payload[k])) out[k] = payload[k]
  })
  return out
}
export const LOC_ALWAYS = ["name", "address", "phone", "hours", "sort_order"]
export const LOC_OPT = [
  "parking",
  "booking_url",
  "place_url",
  "kakao_url",
  "channel_url",
  "map_links",
  "common_sns",
  "sns_by_lang",
]
export const PRAC_ALWAYS = ["name", "education", "career"]
export const PRAC_OPT = ["gender", "specialty", "photo_url"]

function norm(v: unknown): string {
  if (v == null) return ""
  if (typeof v === "object") return JSON.stringify(v)
  return String(v)
}
function locChanged(payload: Record<string, unknown>, piLoc: PiFactLocation): boolean {
  const pruned = pruneUpdate(payload, LOC_ALWAYS, LOC_OPT)
  for (const k of Object.keys(pruned)) {
    if (k === "hours") {
      if (canonHours(pruned.hours as PiHours) !== canonHours(piLoc.hours)) return true
      continue
    }
    if (norm(pruned[k]) !== norm((piLoc as Record<string, unknown>)[k])) return true
  }
  return false
}
function pracChanged(payload: Record<string, unknown>, piPrac: PiFactPractitioner): boolean {
  const pruned = pruneUpdate(payload, PRAC_ALWAYS, PRAC_OPT)
  for (const k of Object.keys(pruned)) {
    const pv = pruned[k]
    const bv = (piPrac as Record<string, unknown>)[k]
    const a = Array.isArray(pv) ? JSON.stringify(pv) : String(pv ?? "")
    const b = Array.isArray(bv) ? JSON.stringify(bv ?? []) : String(bv ?? "")
    if (a !== b) return true
  }
  return false
}
const nfc = (s: unknown) => {
  try {
    return String(s == null ? "" : s).normalize("NFC")
  } catch {
    return String(s == null ? "" : s)
  }
}

export interface SyncDoctor {
  name: string
  jobTitle?: string
  specialty?: string
  photoUrl?: string
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
      payload: { key: locKey, ...pruneUpdate(locPayload, LOC_ALWAYS, LOC_OPT) },
      reason: "신규 지점",
    })
  } else if (locChanged(locPayload, piLoc)) {
    ops.push({
      kind: "location",
      action: "update",
      key: locKey,
      id: piLoc.id,
      name: location.name,
      payload: pruneUpdate(locPayload, LOC_ALWAYS, LOC_OPT),
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
      photo_url: d.photoUrl ? String(d.photoUrl) : "",
    }
    const position = piPosition(d.jobTitle)
    const cand = (piPracByName[nfc(d.name)] || [])[0]
    if (!cand) {
      ops.push({
        kind: "practitioner",
        action: "create",
        name: d.name,
        at: locKey,
        position,
        payload: pruneUpdate(ppay, PRAC_ALWAYS, PRAC_OPT),
        reason: "신규 의료진",
      })
    } else {
      if (pracChanged(ppay, cand))
        ops.push({
          kind: "practitioner",
          action: "update",
          name: d.name,
          id: cand.id,
          payload: pruneUpdate(ppay, PRAC_ALWAYS, PRAC_OPT),
          reason: "의료진 정보 변경",
        })
      const role = (cand.locations || []).find((x) => x.location_key === locKey)
      if (!role)
        ops.push({ kind: "role", action: "set", name: d.name, id: cand.id, at: locKey, position, reason: "지점 배치 추가" })
      else if (role.position !== position)
        ops.push({ kind: "role", action: "set", name: d.name, id: cand.id, at: locKey, position, reason: "직책 변경" })
    }
  })

  // PI에만 있는 의료진 → 삭제 후보(자동 안 함)
  ;(facts.practitioners || []).forEach((p) => {
    if (!siteNames[nfc(p.name)]) {
      warnings.push({ type: "orphan-practitioner", name: p.name, note: "사이트에 없음 — 퇴사면 역할 제거 확인" })
    }
  })

  return { ops, warnings }
}
