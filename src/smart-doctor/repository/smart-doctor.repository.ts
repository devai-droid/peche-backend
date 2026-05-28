import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import axios, { AxiosInstance } from "axios"
import { AccountUser } from "@root/users/entities/user.entity"
import { Building } from "@root/shared/enum/category"
import {
  BUILDING_1_DOCTOR_ID,
  NATIONALITY_CODE,
  BUILDING_2_DOCTOR_ID,
  BUILDING_3_DOCTOR_ID,
} from "@root/shared/constant/smart-doctor"
import { LanguageLocale } from "@root/shared/enum/auth"
import { SmartDoctorReservationCountDto } from "@root/reservation/dto/reservation.dto"

@Injectable()
export class SmartDoctorRepository {
  private readonly logger = new Logger(SmartDoctorRepository.name)
  private readonly ApiBase = "https://reservation.api.receipt.smartdoctor.systems/"
  private api: AxiosInstance

  constructor(private config: ConfigService) {
    // TODO: 환경변수로 변경
    const apiKey =
      "hWSrY5ST9y7dYHaFJzuVf6iU9LtfYe02OICS14ekYhJN8KwgSwnqce2Nt3gR384sV4wtxrIgN4rDAeH6qBu2Fxwfq9NckReMdDcwg4jGEk7UFBXH57TW3kgxeh4184Vs09V1u4Qp2xxvlTl61bp4DADD8poKw3OBhML4s"
    // const apiKey = config.get<string>(Env.SMART_DOCTOR_API_KEY)
    this.api = axios.create({
      baseURL: this.ApiBase,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
  }

  async getCrmCategories() {
    try {
      return await this.requestCrmCategories()
    } catch (e: unknown) {
      this.logger.error("getCrmCategories failed", e)
      throw new Error("getCrmCategories failed")
    }
  }

  async getCustomer(user: AccountUser) {
    try {
      return await this.requestGetCustomer(user)
    } catch (e: unknown) {
      this.logger.error("getCustomer failed", e)
      throw new Error("getCustomer failed")
    }
  }

  async postCustomer(user: AccountUser) {
    try {
      return await this.requestCustomer(user)
    } catch (e: unknown) {
      this.logger.error("postCustomer failed", e)
      throw new Error("postCustomer failed")
    }
  }

  async updateCustomer(user: AccountUser) {
    try {
      return await this.patchCustomer(user)
    } catch (e: unknown) {
      this.logger.error("updateCustomer failed", e)
      throw new Error("updateCustomer failed")
    }
  }

  async postReservation(
    customerNumber: string,
    crmCode: string,
    datetime: Date,
    userMemo?: string,
    adminMemo?: string,
    building?: Building,
  ) {
    try {
      return await this.requestReservation(customerNumber, crmCode, datetime, userMemo, adminMemo, building)
    } catch (e: unknown) {
      this.logger.error("postReservation failed", e)
      throw new Error("postReservation failed")
    }
  }

  async deleteReservation(customerNumber: string, rid: string) {
    try {
      return await this.requestDeleteReservation(customerNumber, rid)
    } catch (e: unknown) {
      this.logger.error("deleteReservation failed", e)
      throw new Error("deleteReservation failed")
    }
  }

  async updateReservation(customerNumber: string, rid: string, datetime?: Date, userMemo?: string, adminMemo?: string) {
    try {
      return await this.requestPatchReservation(customerNumber, rid, datetime, userMemo, adminMemo)
    } catch (e: unknown) {
      this.logger.error("patchReservation failed", e)
      throw new Error("patchReservation failed")
    }
  }

  async requestNationalities() {
    const response = await this.api.get("/reservation-api/nationalities")
    return response.data
  }

  async getReservationCountsByMonth(year: number, month: number, crmCodes?: string[]) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    try {
      return await this.requestReservationCountsByCrmCategory(startDate, endDate, crmCodes)
    } catch (e: unknown) {
      this.logger.error("getReservationCountsByMonth failed", e)
      throw new Error("getReservationCountsByMonth failed")
    }
  }

  async getReservationCountsByCrmCategory(startDate: Date, endDate?: Date, crmCodes?: string[]) {
    try {
      return await this.requestReservationCountsByCrmCategory(startDate, endDate, crmCodes)
    } catch (e: unknown) {
      this.logger.error("getReservationCountsByCrmCategory failed", e)
      throw new Error("getReservationCountsByCrmCategory failed")
    }
  }

  async getCustomerReservations(customerNumber: string) {
    try {
      return await this.requestGetCustomerReservations(customerNumber)
    } catch (e: unknown) {
      this.logger.error("getCustomerReservations failed", e)
      throw new Error("getCustomerReservations failed")
    }
  }

  private async requestCrmCategories() {
    const response = await this.api.get("/reservation-api/users/reservation")
    return response.data.departmentDTOs
  }

  private async requestGetCustomer(user: AccountUser) {
    const response = await this.api.get("/reservation-api/v2/customers", {
      params: {
        cellPhone: user.phoneNumber ? user.phoneNumber.replace("-", "").replace("+820", "0").replace("+82", "0") : "",
        name: user.name,
      },
      paramsSerializer: {
        indexes: null,
      },
    })
    return response.data.customers && response.data.customers.length > 0
      ? response.data.customers[0].customerNumber
      : null
  }

  private async requestCustomer(user: AccountUser) {
    const nationalityCode =
      user.languageLocale === LanguageLocale.ja
        ? NATIONALITY_CODE.JA
        : user.languageLocale === LanguageLocale.zh
        ? NATIONALITY_CODE.ZH
        : user.languageLocale === LanguageLocale.zhTW
        ? NATIONALITY_CODE.ZHTW
        : user.languageLocale === LanguageLocale.th
        ? NATIONALITY_CODE.TH
        : user.languageLocale === LanguageLocale.en
        ? NATIONALITY_CODE.EN
        : NATIONALITY_CODE.KO
    const response = await this.api.post("/reservation-api/v2/customers", {
      cellPhone: user.phoneNumber ? user.phoneNumber.replace("-", "").replace("+820", "0").replace("+82", "0") : "",
      email: user.email ? user.email : "",
      name: user.name,
      nationalityCode: nationalityCode,
      ignoreDuplicateCustomer: true,
    })
    return response.data.customer.customerNumber
  }

  private async patchCustomer(user: AccountUser) {
    const nationalityCode =
      user.languageLocale === LanguageLocale.ja
        ? NATIONALITY_CODE.JA
        : user.languageLocale === LanguageLocale.zh
        ? NATIONALITY_CODE.ZH
        : user.languageLocale === LanguageLocale.zhTW
        ? NATIONALITY_CODE.ZHTW
        : user.languageLocale === LanguageLocale.th
        ? NATIONALITY_CODE.TH
        : user.languageLocale === LanguageLocale.en
        ? NATIONALITY_CODE.EN
        : NATIONALITY_CODE.KO
    const response = await this.api.patch(`/reservation-api/v2/customers/${user.customerNumber}`, {
      nationalityCode: nationalityCode,
    })
    return response.data.customer.customerNumber
  }

  private async requestReservation(
    customerNumber: string,
    crmCode: string,
    datetime: Date,
    userMemo?: string,
    adminMemo?: string,
    building?: Building,
  ) {
    const fixedDatetime = new Date(datetime)
    const hours = ("0" + fixedDatetime.getHours()).slice(-2)
    const minutes = ("0" + fixedDatetime.getMinutes()).slice(-2)
    fixedDatetime.setMinutes(fixedDatetime.getMinutes() + 30)
    const endHours = ("0" + fixedDatetime.getHours()).slice(-2)
    const endMinutes = ("0" + fixedDatetime.getMinutes()).slice(-2)
    const body = {
      subjectCode: "14",
      departmentCode: crmCode,
      chargeDoctorId: (() => {
        switch (building) {
          case Building.BUILDING_1:
            return BUILDING_1_DOCTOR_ID
          case Building.BUILDING_2:
            return BUILDING_2_DOCTOR_ID
          case Building.BUILDING_3:
            return BUILDING_3_DOCTOR_ID
          default:
            return BUILDING_3_DOCTOR_ID
        }
      })(),
      reservationDate: fixedDatetime.toISOString().split("T")[0],
      reservationStartTime: `${hours}:${minutes}`,
      reservationEndTime: `${endHours}:${endMinutes}`,
      ...(adminMemo && { reservationMemo: adminMemo }),
      ...(userMemo && { etcMemo: userMemo }),
    }
    const response = await this.api.post(`/reservation-api/v2/customers/${customerNumber}/reservations`, body)
    return response.data.reservation.id.seqNo
  }

  private async requestDeleteReservation(customerNumber: string, rid: string) {
    const response = await this.api.delete(`/reservation-api/v2/customers/${customerNumber}/reservations/${rid}`)
    return response.data
  }

  private async requestPatchReservation(
    customerNumber: string,
    rid: string,
    datetime?: Date,
    userMemo?: string,
    adminMemo?: string,
  ) {
    const fixedDatetime = datetime ? new Date(datetime) : undefined
    if (fixedDatetime) {
      const hours = ("0" + fixedDatetime.getHours()).slice(-2)
      const minutes = ("0" + fixedDatetime.getMinutes()).slice(-2)
      fixedDatetime.setMinutes(fixedDatetime.getMinutes() + 30)
      const endHours = ("0" + fixedDatetime.getHours()).slice(-2)
      const endMinutes = ("0" + fixedDatetime.getMinutes()).slice(-2)
      return (
        await this.api.patch(`/reservation-api/v2/customers/${customerNumber}/reservations/${rid}`, {
          reservationDate: fixedDatetime.toISOString().split("T")[0],
          reservationStartTime: `${hours}:${minutes}`,
          reservationEndTime: `${endHours}:${endMinutes}`,
          ...(adminMemo && { reservationMemo: adminMemo }),
          ...(userMemo && { etcMemo: userMemo }),
        })
      ).data.reservation.id.seqNo
    }
    return (
      await this.api.patch(`/reservation-api/v2/customers/${customerNumber}/reservations/${rid}`, {
        reservationMemo: adminMemo,
        etcMemo: userMemo,
      })
    ).data.reservation.id.seqNo
  }

  private async requestReservationCountsByCrmCategory(
    startDate: Date,
    endDate?: Date,
    crmCodes?: string[],
  ): Promise<SmartDoctorReservationCountDto[]> {
    const startDateFix = new Date(startDate)
    const endDateFix = endDate ? new Date(endDate) : undefined
    const response = await this.api.get("/reservation-api/v2/departments/reservationCounts", {
      params: {
        ...(crmCodes && crmCodes.length > 0 && { departmentCodes: crmCodes }),
        reservationDate: startDateFix.toISOString().split("T")[0],
        ...(endDateFix && { reservationEndDate: endDateFix.toISOString().split("T")[0] }),
      },
      paramsSerializer: {
        indexes: null,
      },
    })
    return response.data.reservationCounts
  }

  private async requestGetCustomerReservations(customerNumber: string) {
    const response = await this.api.get(`/reservation-api/v2/customers/${customerNumber}/reservations`)
    return response.data.reservations && response.data.reservations.length > 0 ? response.data.reservations : []
  }
}
