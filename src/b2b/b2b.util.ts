import { v5 as uuidv5 } from "uuid"

/** B2B 예약 1건의 회사 정보(예약 당시 값). 닥팔 메모·알림 수신처 결정에 쓴다. */
export interface B2bReservationContext {
  companyId: string
  companyName: string
  discountRate?: number | null
  discountNote?: string | null
  verificationId: string
  email: string
  name: string
  phone: string
}

/** 닥팔 메모 맨 윗줄. 예) "[B2B 협약] 삼성전자 · 협약할인 10% · 제모 제외" */
export const buildB2bMemoLine = (c: {
  companyName: string
  discountRate?: number | null
  discountNote?: string | null
}) => {
  const parts = [`[B2B 협약] ${c.companyName}`]
  if (c.discountRate != null) parts.push(`협약할인 ${Number(c.discountRate)}%`)
  if (c.discountNote) parts.push(c.discountNote)
  return parts.join(" · ")
}

/** 휴대폰 번호를 기존 회원과 같은 형식(+8210...)으로 정규화. 형식이 틀리면 null. */
export const normalizeKoreanMobile = (raw: string): string | null => {
  const digits = (raw ?? "").replace(/[^0-9+]/g, "")
  let local = digits
  if (local.startsWith("+82")) local = "0" + local.slice(3)
  else if (local.startsWith("82")) local = "0" + local.slice(2)
  if (!/^01[016789][0-9]{7,8}$/.test(local)) return null
  return "+82" + local.slice(1)
}

// B2B 전용 닥팔 환자 번호 생성용 고정 네임스페이스(변경 금지: 바꾸면 같은 직원이 닥팔에 새 환자로 생김)
const B2B_PATIENT_NAMESPACE = "6b1f3c2e-8d4a-4b7e-9c1d-2f5a7e9b0c3d"

/**
 * 닥팔 환자 번호(B2B 예약용). 회사 이메일별로 고정된 값.
 * 회원 번호를 그대로 쓰면 공식 사이트에서 먼저 만든 닥팔 환자(예: 영문 이름)가 재사용돼
 * B2B 예약 때 입력한 이름이 닥팔에 반영되지 않으므로 분리한다.
 */
export const b2bPatientId = (email: string) => uuidv5(`b2b:${email.trim().toLowerCase()}`, B2B_PATIENT_NAMESPACE)
