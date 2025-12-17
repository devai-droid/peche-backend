import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import axios, { AxiosInstance } from "axios"
import { SCHEDULE_CODE } from "@root/shared/constant/doctor-palette"
import { CreateReservationDto } from "@root/reservation/dto/reservation.dto"

@Injectable()
export class DoctorPaletteRepository {
  private readonly logger = new Logger(DoctorPaletteRepository.name)
  private api: AxiosInstance

  constructor(private readonly config: ConfigService) {
    // const token = this.config.get<string>("DOCTOR_PALETTE_TOKEN")
    const apiKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMzQ1Mjc2Yi0yMDgwLTQwZDgtODU4NC0wZWY4MWM5YmUzOGIiLCJzdWIiOiJHRU5FUkFMIiwic3ViX3R5cGUiOiJQQVJUTkVSX0FQSSIsImlhdCI6MTc2NTI2Njk3NX0.K5k22_CPZjpCIRrqUb2ZO7oBBfL2njpZ-NsbXqjLxoU"

    if (!apiKey) {
      this.logger.error("DOCTOR_PALETTE_TOKEN is missing!")
    }

    this.api = axios.create({
      baseURL: "https://planner-api.pltt.cloud/planner/v1",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })
  }

  // ────────────────────────────────────
  // Schedule
  // ────────────────────────────────────

  /** 스케줄 목록 조회 */
  async getSchedules() {
    try {
      const res = await this.api.get("/schedule")
      return res.data
    } catch (e) {
      this.logger.error("getSchedules failed", e)
      throw new Error("getSchedules failed")
    }
  }

  /** 특정 스케줄 정보 조회 */
  async getSchedule(scheduleId: string) {
    try {
      const res = await this.api.get(`/schedule/${scheduleId}`)
      return res.data
    } catch (e) {
      this.logger.error("getSchedule failed", e)
      throw new Error("getSchedule failed")
    }
  }

  /** 특정 날짜의 스케줄 슬롯 조회 */
  async getScheduleSlots(date: string) {
    try {
      const res = await this.api.get(`/schedule/dateTime/${SCHEDULE_CODE}`, {
        params: { date }, // 자동으로 ?date=YYYY-MM-DD 붙음
      })
      return res.data
    } catch (e) {
      this.logger.error("getScheduleSlots failed", e)
      throw new Error("getScheduleSlots failed")
    }
  }

  // ────────────────────────────────────
  // Plan (예약)
  // ────────────────────────────────────

  /**
   * 예약 생성
   * patient.id → 페슈 내부 유저 ID 또는 memberId 등을 string으로 넘기면 됨
   */
  async createPlan(
    customerName: string,
    customerId: string,
    phone: string,
    dto: CreateReservationDto & { userId?: string; phoneNumber?: string; email?: string },
    eventNames: string[],
    productNames: string[],
  ) {
    try {
      // -------- dateTime 변환 (UTC → KST) --------
      // dto.datetime은 Date 객체 (UTC 기준)
      const dateObj = new Date(dto.datetime)

      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, "0")
      const day = String(dateObj.getDate()).padStart(2, "0")
      const hours = String(dateObj.getHours()).padStart(2, "0")
      const minutes = String(dateObj.getMinutes()).padStart(2, "0")

      const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`

      // -------- treatments 생성 --------
      const treatments = [...(eventNames ?? []), ...(productNames ?? [])]

      // -----------------------------------------
      // 예약 API Body 생성
      // -----------------------------------------
      const payload = {
        scheduleId: SCHEDULE_CODE,
        patient: {
          id: customerId,
          name: customerName,
          phone,
        },
        dateTime: formattedDateTime,
        status: "REQUESTED",
        treatments,
        // requestMessage: dto.userMemo ?? undefined,
      }

      this.logger.log("Doctor Palette createPlan payload: " + JSON.stringify(payload))

      const res = await this.api.post("/plan", payload)
      return res.data
    } catch (e) {
      this.logger.error("createPlan failed", e.response?.data || e)
      throw new Error("createPlan failed")
    }
  }

  /** Plan 조회 */
  async getPlan(planId: string) {
    try {
      const res = await this.api.get(`/plan/${planId}`)
      return res.data
    } catch (e) {
      this.logger.error("getPlan failed", e)
      throw new Error("getPlan failed")
    }
  }

  // 닥터 팔레트 Plan 수정 (scheduleId는 항상 SCHEDULE_CODE로 자동 세팅)
  async updatePlan(
    planId: string,
    dto: Partial<{
      dateTime: string
      status: "REQUESTED" | "CONFIRMED" | "CANCELED"
      requestMessage: string
      meta: any
    }>,
  ) {
    try {
      const payload = {
        scheduleId: SCHEDULE_CODE, // 항상 같은 스케줄 ID 사용
        ...dto,
      }

      this.logger.log("Doctor Palette updatePlan payload: " + JSON.stringify(payload))

      const res = await this.api.patch(`/plan/${planId}`, payload)
      return res.data
    } catch (e) {
      this.logger.error("updatePlan failed", e.response?.data || e)
      throw new Error("updatePlan failed")
    }
  }

  async deletePlan(planId: string, body: { isNoShow: boolean; reason?: string }) {
    try {
      const res = await this.api.delete(`/plan/${planId}`, {
        data: body,
      })
      return res.data
    } catch (e) {
      this.logger.error("deletePlan failed", e.response?.data || e)
      throw new Error("deletePlan failed")
    }
  }
}
