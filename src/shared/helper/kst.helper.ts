// 게시기간(노출기간) 비교용 KST 날짜 경계 유틸.
// 어드민은 게시기간을 "날짜"만 지정하지만 저장 시 시각이 붙는다. 그 시각을 무시하고
// 한국시간(KST, UTC+9) "날짜 단위"로 비교하기 위해 오늘 0시/내일 0시(KST)를 UTC 인스턴트로 반환.
//
// 노출 판정: postStartDate < tomorrowStart && postEndDate >= todayStart
//   - postStartDate 의 KST 날짜 <= 오늘  ⟺  postStartDate < 내일 0시(KST)
//   - postEndDate   의 KST 날짜 >= 오늘  ⟺  postEndDate  >= 오늘 0시(KST)
export function kstDayBounds(): { todayStart: Date; tomorrowStart: Date } {
  const KST_OFFSET = 9 * 60 * 60 * 1000
  const DAY = 24 * 60 * 60 * 1000
  const base = Math.floor((Date.now() + KST_OFFSET) / DAY) * DAY - KST_OFFSET
  return { todayStart: new Date(base), tomorrowStart: new Date(base + DAY) }
}
