import { ReservationCategory } from "@root/shared/enum/reservation"

export const SCHEDULE_CODE = "8515" // 첫방문 상담(초진) 스케줄 ID — 기본값/하위호환

// 홈페이지 예약 분류 → 닥터팔레트 스케줄 ID 매핑
// 각 스케줄의 예약 가능 시간은 닥터팔레트 스케줄러에서 스케줄별로 따로 관리됨
export const SCHEDULE_CODE_BY_CATEGORY: Record<ReservationCategory, string> = {
  [ReservationCategory.A]: "8515", // 초진
  [ReservationCategory.B]: "8925", // 재진 보유권 시술
  [ReservationCategory.C]: "31120", // 제모 보유권 시술
}

// 분류 → 스케줄 ID (없거나 알 수 없으면 초진 스케줄로 폴백)
export const resolveScheduleCode = (category?: ReservationCategory): string =>
  (category && SCHEDULE_CODE_BY_CATEGORY[category]) || SCHEDULE_CODE
