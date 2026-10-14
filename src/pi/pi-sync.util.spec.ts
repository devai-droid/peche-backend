import {
  bookingSettingsChanged,
  bookingUrlOf,
  canon,
  mergeLocalized,
  parsePecheClock,
  pecheHoursToPI,
  piPosition,
  piPractitionerKey,
  piLangOf,
  planSync,
  reservationNoticeOf,
  toUpdatePayload,
  type PiFacts,
  type PiLocationPayload,
  type SyncDoctor,
} from "@root/pi/pi-sync.util"

// PI(챗봇) 동기화 순수부 — 원칙: 사이트가 원본, PI는 받아 적는 쪽(값 변형 없음·빈 값도 보냄·PI에만 남는 값 없음).

const payloadOf = (op: { kind: string }): Record<string, unknown> => (op as { payload?: Record<string, unknown> }).payload || {}

describe("진료시간 파싱", () => {
  it("AM/PM·24시 표기를 HH:MM으로", () => {
    expect(parsePecheClock("AM 10:30")).toBe("10:30")
    expect(parsePecheClock("PM 21:00")).toBe("21:00")
    expect(parsePecheClock("PM 8:00")).toBe("20:00")
    expect(parsePecheClock("AM 12:10")).toBe("00:10")
    expect(parsePecheClock("")).toBe("")
  })
  it("평일·주말·공휴일 줄을 PI 요일 묶음으로, 점심 안내는 notes로", () => {
    const h = pecheHoursToPI({
      weekdayHours: "평일 : AM 10:30 ~ PM 21:00",
      weekendHours: "주말·공휴일 : AM 10:00 ~ PM 18:00",
      lunchInfo: "※ 점심시간 없이 연중무휴 진료합니다.",
    })
    expect(h.weekly).toEqual([
      { days: ["mon", "tue", "wed", "thu", "fri"], open: "10:30", close: "21:00", break: null },
      { days: ["sat", "sun", "pub"], open: "10:00", close: "18:00", break: null },
    ])
    expect(h.notes).toEqual(["점심시간 없이 연중무휴 진료합니다."])
  })
  it("못 읽는 형식은 줄을 버린다(빈 weekly)", () => {
    expect(pecheHoursToPI({ weekdayHours: "10시부터 9시까지" }).weekly).toEqual([])
  })
})

describe("값 변형 없음", () => {
  it("직함은 사이트 값 그대로, 비면 원장", () => {
    expect(piPosition("총괄원장")).toBe("총괄원장")
    expect(piPosition(" 대표원장 ")).toBe("대표원장")
    expect(piPosition("")).toBe("원장")
  })
  it("예약 링크는 사이트 주소에서(언어 접두 ko)", () => {
    expect(bookingUrlOf("https://pecheskin.clinic/")).toBe("https://pecheskin.clinic/ko/reservation/new")
    expect(bookingUrlOf("")).toBeNull()
    expect(bookingUrlOf("pecheskin.clinic")).toBeNull()
  })
  it("신규 의료진 내부 이름은 고유 번호 기반(PI 슬러그 규칙 [a-z0-9._-])", () => {
    const k = piPractitionerKey("3F2A9C1E-7b4d-4e8a-9c2d-1a2b3c4d5e6f")
    expect(k).toBe("doc-3f2a9c1e-7b4d-4e8a-9c2d-1a2b3c4d5e6f")
    expect(k).toMatch(/^[a-z0-9][a-z0-9._-]{0,99}$/)
  })
})

describe("canon · toUpdatePayload", () => {
  it("키 순서가 달라도 같고(jsonb 왕복), 빈 값(null·''·[]·{})은 전부 같다", () => {
    expect(canon({ a: 1, b: { c: [1, 2] } })).toBe(canon({ b: { c: [1, 2] }, a: 1 }))
    expect(canon(null)).toBe(canon(""))
    expect(canon([])).toBe(canon({}))
    expect(canon({ a: null })).toBe("")
    expect(canon("x")).not.toBe(canon("y"))
  })
  it("보낼 payload는 키 전부, 빈 값은 null(PI를 비운다)", () => {
    expect(toUpdatePayload({ a: "x", b: "", c: [], d: undefined }, ["a", "b", "c", "d"])).toEqual({ a: "x", b: null, c: null, d: null })
    // PI가 배열만 받는 칸(의료진 학력·경력·전문분야)은 빈 값을 []로
    expect(toUpdatePayload({ a: "", b: null }, ["a", "b"], ["a"])).toEqual({ a: [], b: null })
  })
})

const LOC: PiLocationPayload = {
  key: "peche",
  name: "페슈의원",
  address: "서울 강남구 강남대로 364",
  phone: "02-553-8176",
  hours: { weekly: [{ days: ["mon", "tue"], open: "10:30", close: "21:00", break: null }], notes: [] },
  parking: "",
  booking_url: "https://pecheskin.clinic/ko/reservation/new",
  kakao_url: "http://pf.kakao.com/_dxoiLn",
  place_url: "https://naver.me/x",
  map_links: { naver: "https://naver.me/x", google: "https://maps.app.goo.gl/y" },
  common_sns: [],
  sns_by_lang: {
    ko: { primary: { platform: "kakao", url: "http://pf.kakao.com/_dxoiLn" }, channels: [{ platform: "kakao", url: "http://pf.kakao.com/_dxoiLn" }] },
    "zh-CN": { primary: { platform: "wechat", url: null, image_url: "https://cdn/wechat.png" }, channels: [] },
  },
}
const DOCS: SyncDoctor[] = [
  { id: "11111111-1111-4111-8111-111111111111", name: "안태언", jobTitle: "대표원장", photoUrl: "https://cdn/ahn.jpg" },
  { id: "22222222-2222-4222-8222-222222222222", name: "최재형", jobTitle: "총괄원장" },
]
/** PI가 돌려주는 모양: jsonb라 키 순서가 바뀌고, 빈 값은 null */
const FACTS_SAME: PiFacts = {
  locations: [
    {
      id: "L1",
      key: "peche",
      name: "페슈의원",
      address: "서울 강남구 강남대로 364",
      phone: "02-553-8176",
      hours: { weekly: [{ days: ["tue", "mon"], open: "10:30", close: "21:00", break: null }], notes: [] },
      parking: null,
      booking_url: "https://pecheskin.clinic/ko/reservation/new",
      kakao_url: "http://pf.kakao.com/_dxoiLn",
      place_url: "https://naver.me/x",
      channel_url: null,
      map_links: { google: "https://maps.app.goo.gl/y", naver: "https://naver.me/x" },
      common_sns: null,
      sns_by_lang: {
        "zh-CN": { channels: [], primary: { image_url: "https://cdn/wechat.png", url: null, platform: "wechat" } },
        ko: { channels: [{ url: "http://pf.kakao.com/_dxoiLn", platform: "kakao" }], primary: { url: "http://pf.kakao.com/_dxoiLn", platform: "kakao" } },
      },
      sort_order: 0,
    },
  ],
  practitioners: [
    { id: "P1", key: "ahn-taeeon", name: "안태언", education: [], career: [], specialty: [], photo_url: "https://cdn/ahn.jpg", locations: [{ location_key: "peche", position: "대표원장" }] },
    { id: "P2", key: "choi-jaehyung", name: "최재형", education: [], career: [], specialty: [], photo_url: null as unknown as string, locations: [{ location_key: "peche", position: "총괄원장" }] },
  ],
}

describe("planSync", () => {
  it("PI와 같으면(키 순서·빈 값 표기만 다름) 작업 0건 — 저장할 때마다 전송이 반복되지 않는다", () => {
    const { ops, warnings } = planSync(LOC, DOCS, FACTS_SAME)
    expect(ops).toEqual([])
    expect(warnings).toEqual([])
  })

  it("PI에 지점이 없으면 생성(키 전부·빈 값은 null), 의료진은 고유 번호 기반 key로 생성 + 배치", () => {
    const { ops } = planSync(LOC, DOCS, { locations: [], practitioners: [] })
    const loc = ops.find((o) => o.kind === "location")!
    expect(loc.action).toBe("create")
    expect(payloadOf(loc)).toMatchObject({ key: "peche", parking: null, common_sns: null, channel_url: null, sort_order: 0 })
    const ahn = ops.find((o) => o.kind === "practitioner" && o.name === "안태언")!
    expect(ahn).toMatchObject({ action: "create", key: "doc-11111111-1111-4111-8111-111111111111", at: "peche", position: "대표원장" })
    expect(payloadOf(ahn)).toEqual({ name: "안태언", education: [], career: [], specialty: [], photo_url: "https://cdn/ahn.jpg" })
    const choi = ops.find((o) => o.kind === "practitioner" && o.name === "최재형")!
    expect(choi).toMatchObject({ action: "create", position: "총괄원장" })
  })

  it("사이트에서 값을 지우면 PI도 비운다(null 전송)", () => {
    const cleared = { ...LOC, map_links: undefined, place_url: "" }
    const { ops } = planSync(cleared, DOCS, FACTS_SAME)
    const loc = ops.find((o) => o.kind === "location")!
    expect(loc.action).toBe("update")
    expect(payloadOf(loc)).toMatchObject({ map_links: null, place_url: null })
  })

  it("직책이 바뀌면 배치만 갱신, 사이트에 없는 의료진은 삭제, 사이트 0명이면 삭제 보류", () => {
    const docs = [{ ...DOCS[0], jobTitle: "원장" }]
    const { ops } = planSync(LOC, docs, FACTS_SAME)
    expect(ops).toEqual([
      expect.objectContaining({ kind: "role", name: "안태언", position: "원장", reason: "직책 변경" }),
      expect.objectContaining({ kind: "practitioner", action: "delete", name: "최재형", id: "P2" }),
    ])
    const guarded = planSync(LOC, [], FACTS_SAME)
    expect(guarded.ops.filter((o) => o.kind === "practitioner")).toEqual([])
    expect(guarded.warnings.map((w) => w.name).sort()).toEqual(["안태언", "최재형"])
  })

  it("사진·전공이 바뀌면 의료진 수정", () => {
    const docs = [{ ...DOCS[0], specialty: "피부과" }, DOCS[1]]
    const { ops } = planSync(LOC, docs, FACTS_SAME)
    expect(ops).toEqual([expect.objectContaining({ kind: "practitioner", action: "update", id: "P1" })])
    expect(payloadOf(ops[0]).specialty).toEqual(["피부과"])
  })
})

describe("예약 설정(reservation_notice) — 사이트 예약 화면과 같은 판정(getMerged 병합 후 enabled && 문구)", () => {
  const ON = { reservationNotice: "  예약 전 안내입니다.\n  ", reservationNoticeEnabled: true }
  it("언어별 값이 비면 기본(ko)을 따르고, false·문구는 덮는다 · zh→zh-CN · 목록 밖 언어는 버린다", () => {
    const v = reservationNoticeOf(ON, [
      { lang: "zh", reservationNotice: "预约须知", reservationNoticeEnabled: true },
      { lang: "ja", reservationNotice: "ご予約前のご案内", reservationNoticeEnabled: false },
      { lang: "en", reservationNotice: "Notice", reservationNoticeEnabled: null },
      { lang: "th", reservationNotice: null, reservationNoticeEnabled: null },
      { lang: "zh-TW", reservationNotice: "   ", reservationNoticeEnabled: true },
      { lang: "xx", reservationNotice: "모르는 언어", reservationNoticeEnabled: true },
    ])
    expect(v).toEqual({
      ko: "예약 전 안내입니다.",
      "zh-CN": "预约须知",
      en: "Notice", // enabled=null·문구 있음 + 기본 켜짐 → 포함
      th: "예약 전 안내입니다.", // 둘 다 비어 있음 → 기본 그대로
      // ja: enabled=false → 제외 / zh-TW: 공백 문구가 기본을 덮고 trim 뒤 비어 → 제외
    })
    expect(piLangOf("zh")).toBe("zh-CN")
    expect(piLangOf("xx")).toBeNull()
  })
  it("언어별 행이 없어도 기본이 켜져 있으면 모든 사이트 언어에 ko 문구", () => {
    const t = "예약 전 안내입니다."
    expect(reservationNoticeOf(ON, [])).toEqual({ ko: t, en: t, "zh-CN": t, ja: t, th: t, "zh-TW": t })
  })
  it("기본을 끄면: 언어별 ko 행은 무시, 켠 언어만 남는다", () => {
    expect(
      reservationNoticeOf({ reservationNotice: "안내", reservationNoticeEnabled: false }, [
        { lang: "ko", reservationNotice: "다른 안내", reservationNoticeEnabled: true },
        { lang: "ja", reservationNotice: null, reservationNoticeEnabled: true },
      ]),
    ).toEqual({ ja: "안내" })
  })
  it("담을 언어가 없으면 null(PI에서 지운다)", () => {
    expect(reservationNoticeOf({ reservationNotice: "", reservationNoticeEnabled: true }, [])).toBeNull()
    expect(reservationNoticeOf(null, [])).toBeNull()
  })
  it("병합 규칙(getMerged 공용): 배열은 1개 이상·값은 null·''이 아닐 때만 덮는다, 행이 없으면 기본 그대로", () => {
    const base = { a: "기본", b: ["x"], c: true }
    expect(mergeLocalized(base, { a: "", b: [], c: false }, ["a", "b", "c"])).toEqual({ a: "기본", b: ["x"], c: false })
    expect(mergeLocalized(base, { a: "번역" }, ["b"])).toEqual(base)
    expect(mergeLocalized(base, null, ["a"])).toBe(base)
  })
  it("비교: 키 순서 무시·null과 {}·없는 칸은 같다, 문구가 다르면 다르다", () => {
    const local = { reservation_notice: { ko: "안내", ja: "案内" } }
    expect(bookingSettingsChanged(local, { reservation_notice: { ja: "案内", ko: "안내" } })).toBe(false)
    expect(bookingSettingsChanged(local, { reservation_notice: { ko: "안내", ja: "案内2" } })).toBe(true)
    expect(bookingSettingsChanged(local, { reservation_notice: null })).toBe(true)
    expect(bookingSettingsChanged({ reservation_notice: null }, { reservation_notice: {} })).toBe(false)
    expect(bookingSettingsChanged({ reservation_notice: null }, {})).toBe(false)
    expect(bookingSettingsChanged({ reservation_notice: null }, null)).toBe(false)
  })
})
