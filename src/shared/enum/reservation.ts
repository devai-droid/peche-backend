export enum ReservationStatus {
  WAITING = "WAITING",
  DONE = "DONE",
  CANCELED = "CANCELED",
}

// 홈페이지 예약 → 닥터팔레트 스케줄 분류
// A: 초진(방문상담/장바구니), B: 재진 보유권 시술, C: 제모 보유권 시술
export enum ReservationCategory {
  A = "A",
  B = "B",
  C = "C",
}

export enum DaysOfWeek {
  SUN = "SUN",
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT",
}
