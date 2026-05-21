import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Between, FindManyOptions, ILike, In, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { Reservation } from "@root/reservation/entities/reservation.entity"
import {
  AvailableReservationByDayDto,
  AvailableReservationByMonthDto,
  AvailableReservationDto,
  AvailableReservationResultDto,
  CreateReservationDto,
  ReservationCountByDatetimeResultDto,
  ReservationCountByDayResultDto,
  ReservationCountByMonthDto,
  ReservationDto,
  SmartDoctorReservationCountDto,
  UpdateReservationDto,
} from "@root/reservation/dto/reservation.dto"
import { ReservationQueryDto } from "@root/reservation/dto/reservation-query.dto"
import { ReservationEventService } from "@root/reservation/service/reservation-event.service"
import { ReservationProductService } from "@root/reservation/service/reservation-product.service"
import { CloseDayService } from "@root/reservation/service/close-day.service"
import { SpecificDateService } from "@root/reservation/service/specific-date.service"
import { ReservationSlotService } from "@root/reservation/service/reservation-slot.service"
import { Building } from "@root/shared/enum/category"
import { ProductService } from "@root/product/service/product.service"
import { EventService } from "@root/event/service/event.service"
import { ReservationStatus } from "@root/shared/enum/reservation"
import { SmartDoctorRepository } from "@root/smart-doctor/repository/smart-doctor.repository"
import { DoctorPaletteRepository } from "@root/doctor-palette/repository/doctor-palette.repository"
import { UserService } from "@root/users/service/user.service"
import { numberToDayOfWeekString } from "@root/shared/utils"
import { SystemConstantsService } from "@root/system/service/system-constants.service"
import { SystemConstantsKey } from "@root/shared/enum/system"
import { UserHelper } from "@root/shared/helper/user.helper"
import { I18nContext, I18nService } from "nestjs-i18n"
import { SmsService } from "@root/message/service/sms.service"
import { SesService } from "@root/message/service/ses.service"
import * as dayjs from "dayjs"
import { AuthProvider, LanguageLocale } from "@root/shared/enum/auth"
import { KakaoNotificationService } from "@root/message/service/kakao-notification.service"
import { KAKAO_TEMPLATE } from "@root/message/constant/kakao-notification.constant"
import { IntegratedCrmCategoryService } from "@root/smart-doctor/service/integrated-crm-category.service"
import { SpecificDateSlot } from "@root/reservation/entities/specific-date-slot.entity"
import { ReservationSlot } from "../entities/reservation-slot.entity"
import { Event } from "@root/event/entities/event.entity"
import { LangCrmCategoryService } from "@root/smart-doctor/service/lang-crm-category.service"
import { LangCrmCategory } from "@root/smart-doctor/entities/lang-crm-category.entity"
import { CategoryGroup } from "@root/smart-doctor/entities/category-group"

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private repository: Repository<Reservation>,
    @Inject(forwardRef(() => ReservationProductService))
    private readonly reservationProductService: ReservationProductService,
    @Inject(forwardRef(() => ReservationEventService))
    private readonly reservationEventService: ReservationEventService,
    @Inject(forwardRef(() => CloseDayService)) private readonly closeDayService: CloseDayService,
    @Inject(forwardRef(() => SpecificDateService)) private readonly specificDateService: SpecificDateService,
    @Inject(forwardRef(() => ReservationSlotService)) private readonly reservationSlotService: ReservationSlotService,
    @Inject(forwardRef(() => ProductService)) private readonly productService: ProductService,
    @Inject(forwardRef(() => EventService)) private readonly eventService: EventService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => SystemConstantsService)) private readonly systemConstantsService: SystemConstantsService,
    private readonly smartDoctorRepository: SmartDoctorRepository,
    private readonly doctorPaletteRepository: DoctorPaletteRepository,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => SmsService)) private readonly smsService: SmsService,
    @Inject(forwardRef(() => SesService)) private readonly sesService: SesService,
    @Inject(forwardRef(() => KakaoNotificationService)) private readonly kakaoService: KakaoNotificationService,
    @Inject(forwardRef(() => IntegratedCrmCategoryService))
    private readonly integratedCrmCategoryService: IntegratedCrmCategoryService,
    @Inject(forwardRef(() => LangCrmCategoryService))
    private readonly langCrmCategoryService: LangCrmCategoryService,
  ) {}

  async create(dto: CreateReservationDto, user: User) {
    this.checkDto(dto)
    await this.checkAvailableEvent(dto.eventIds, dto.datetime)
    user.locale = await this.getUserLanguage(user)
    const building = Building.BUILDING_1
    const datetime = new Date(dto.datetime)
    dto.datetime = new Date(
      datetime.getFullYear(),
      datetime.getMonth(),
      datetime.getDate(),
      datetime.getHours(),
      datetime.getMinutes(),
      0,
    )
    let planId = undefined
    let eventObjs = undefined
    let productObjs = undefined
    if (dto.status == ReservationStatus.DONE || !dto.status) {
      const autoReservationConfirm = await this.systemConstantsService.findOneOrNull(
        SystemConstantsKey.AUTO_RESERVATION_CONFIRM,
      )
      if (
        (autoReservationConfirm && autoReservationConfirm.value == true) ||
        (UserHelper.isAdmin(user) && dto.status == ReservationStatus.DONE)
      ) {
        if (!dto.status) {
          // 일단 WAITING 으로 세팅. 팔레트 측에서 확정할 것 임.
          dto.status = ReservationStatus.WAITING
        }
        const customerName = await this.getCustomerName(user)
        const customerId = await this.getCustomerId(user)
        const phone = await this.getCustomerPhone(user)
        const email = await this.getCustomerEmail(user)
        const contact = phone || email
        // 이벤트 이름, 상품 이름 조회
        if (dto.eventIds && dto.eventIds.length > 0) {
          eventObjs = await this.eventService.findManyByIds(dto.eventIds)
        }
        if (dto.productIds && dto.productIds.length > 0) {
          productObjs = await this.productService.findManyByIds(dto.productIds)
        }
        const eventNames = eventObjs?.map((e) =>
          e.category?.name ? `[${e.category.name}] ${e.name}` : e.name,
        )
        const productNames = productObjs?.map((p) => p.name)
        // 닥터팔레트 예약
        planId = await this.postReservationAndGetPlanId(
          customerName,
          customerId,
          contact,
          dto,
          eventNames,
          productNames,
        )
      } else {
        dto.status = ReservationStatus.WAITING
      }
    }
    const reservation = await this.repository.save(
      Object.assign(dto, { user: user, building: building, palettePlanId: planId.id }),
    )
    if (dto.eventIds && dto.eventIds.length > 0) {
      await this.reservationEventService.bulkCreate(reservation, dto.eventIds)
    }
    if (dto.productIds && dto.productIds.length > 0) {
      await this.reservationProductService.bulkCreate(reservation, dto.productIds)
    }
    const newReservation = await this.findOne(reservation.id)
    await this.sendNewReservationMessage(newReservation)
    return newReservation
  }

  async sendNewReservationMessage(reservation: Reservation) {
    const { user } = reservation
    const lang = user.languageLocale ?? I18nContext.current().lang
    // const reservationBuilding = reservation.building
    const title = this.i18n.t("MESSAGES.NOTIFICATION.SUBJECT_NEW_RESERVATION", { lang })
    const args = {
      name: user.name ?? "",
      date: dayjs(reservation.datetime).format("MM-DD"),
      time: dayjs(reservation.datetime).format("A hh:mm"),
    }

    const translationKey = "MESSAGES.NOTIFICATION.NEW_RESERVATION_LONG_BUILDING_1"

    const longMessage = this.i18n.t(translationKey, { lang, args })

    if (!user.phoneNumber && user.email) {
      await this.sendSesEmail(user.email, title, longMessage)
    } else if (user.phoneNumber && (user.provider == AuthProvider.KAKAO || lang == LanguageLocale.ko)) {
      await this.kakaoService.sendReservationInstantMessage(
        [user.phoneNumber],
        {
          [KAKAO_TEMPLATE.FIELD_NAME]: args.name,
          [KAKAO_TEMPLATE.FIELD_RESERVATION_DATE]: args.date,
          [KAKAO_TEMPLATE.FIELD_RESERVATION_TIME]: args.time,
        },
        reservation.building,
      )
    } else if (user.phoneNumber) {
      await this.smsService.sendConfirmReservationSms(user.phoneNumber, reservation.datetime, reservation.building)
    }
  }

  // 팔레트 웹훅 받고 예약 확정 알림 발송
  async sendPaletteReservationConfirmationMessage(reservation: Reservation) {
    const { user } = reservation
    const lang = user.languageLocale ?? I18nContext.current().lang
    const reservationBuilding = reservation.building
    const title = this.i18n.t("MESSAGES.NOTIFICATION.SUBJECT_CONFIRMATION", { lang })
    const args = {
      name: user.name ?? "",
      date: dayjs(reservation.datetime).format("MM-DD"),
      time: dayjs(reservation.datetime).format("A hh:mm"),
    }

    const translationKey = "MESSAGES.NOTIFICATION.RESERVATION_CONFIRMATION"

    const longMessage = this.i18n.t(translationKey, { lang, args })

    if (!user.phoneNumber && user.email) {
      await this.sendSesEmail(user.email, title, longMessage)
    } else if (user.phoneNumber && (user.provider == AuthProvider.KAKAO || lang == LanguageLocale.ko)) {
      await this.kakaoService.sendReservationConfirmationMessage(
        [user.phoneNumber],
        {
          [KAKAO_TEMPLATE.FIELD_NAME]: args.name,
          [KAKAO_TEMPLATE.FIELD_RESERVATION_DATE]: args.date,
          [KAKAO_TEMPLATE.FIELD_RESERVATION_TIME]: args.time,
        },
        reservation.building,
      )
    } else if (user.phoneNumber) {
      await this.smsService.sendConfirmReservationSms(user.phoneNumber, reservation.datetime, reservation.building)
    }
  }

  async sendReservationTheDayMessage() {
    const kstToday = dayjs().add(9, "hour").toDate()
    const { startDatetime, endDatetime } = this.dayRange(kstToday)
    const reservations = await this.repository.find({
      relations: ["user"],
      where: { datetime: Between(startDatetime, endDatetime), status: ReservationStatus.DONE },
    })
    for (const reservation of reservations) {
      const user = reservation.user
      const lang = user.languageLocale
      const title = this.i18n.t("MESSAGES.NOTIFICATION.TITLE", { lang })
      const longMessage = this.i18n.t("MESSAGES.NOTIFICATION.ON_THE_DAY_LONG", {
        lang: lang,
        args: {
          name: reservation.user.name ?? "",
          date: dayjs(reservation.datetime).format("MM-DD"),
          time: dayjs(reservation.datetime).format("A hh:mm"),
        },
      })
      if (user.email) {
        await this.sendSesEmail(user.email, title, longMessage)
      }
      if (user.phoneNumber && (user.phoneNumber.startsWith("+82") || user.provider == AuthProvider.KAKAO)) {
        await this.kakaoService.sendReservationTheDayMessage(
          [user.phoneNumber],
          {
            [KAKAO_TEMPLATE.FIELD_NAME]: user.name ?? "고객",
            [KAKAO_TEMPLATE.FIELD_RESERVATION_TIME]: dayjs(reservation.datetime).format("A hh:mm"),
          },
          reservation.building,
        )
      }
    }
  }

  async sendReservationDayBeforeMessage() {
    const kstTomorrow = dayjs().add(33, "hour").toDate()
    const { startDatetime, endDatetime } = this.dayRange(kstTomorrow)
    const reservations = await this.repository.find({
      relations: ["user"],
      where: { datetime: Between(startDatetime, endDatetime), status: ReservationStatus.DONE },
    })
    for (const reservation of reservations) {
      const user = reservation.user
      const lang = user.languageLocale
      const title = this.i18n.t("MESSAGES.NOTIFICATION.TITLE", { lang })
      const longMessage = this.i18n.t("MESSAGES.NOTIFICATION.THE_DAY_BEFORE_LONG", {
        lang: lang,
        args: {
          name: reservation.user.name ?? "",
          date: dayjs(reservation.datetime).format("MM-DD"),
          time: dayjs(reservation.datetime).format("A hh:mm"),
        },
      })
      if (user.email) {
        await this.sendSesEmail(user.email, title, longMessage)
      }
      if (user.phoneNumber && (user.phoneNumber.startsWith("+82") || user.provider == AuthProvider.KAKAO)) {
        await this.kakaoService.sendReservationDayBeforeMessage(
          [user.phoneNumber],
          {
            [KAKAO_TEMPLATE.FIELD_NAME]: user.name ?? "고객",
            [KAKAO_TEMPLATE.FIELD_RESERVATION_DATE]: dayjs(reservation.datetime).format("MM-DD"),
            [KAKAO_TEMPLATE.FIELD_RESERVATION_TIME]: dayjs(reservation.datetime).format("A hh:mm"),
          },
          reservation.building,
        )
      }
    }
  }

  async sendCancelReservationMessage(reservation: Reservation) {
    try {
      const user = reservation.user
      const lang = user.languageLocale
      if (user.email) {
        await this.sendSesEmail(
          user.email,
          this.i18n.t("MESSAGES.NOTIFICATION.SUBJECT_CANCELLATION", { lang }),
          this.i18n.t("MESSAGES.NOTIFICATION.RESERVATION_CANCELLATION", {
            lang,
            args: {
              name: user.name ?? "",
              date: dayjs(reservation.datetime).format("MM-DD"),
              time: dayjs(reservation.datetime).format("A hh:mm"),
            },
          }),
        )
      }

      if (user.phoneNumber && (user.phoneNumber.startsWith("+82") || user.provider == AuthProvider.KAKAO)) {
        await this.kakaoService.sendReservationCancelMessage([reservation.user.phoneNumber], {
          [KAKAO_TEMPLATE.FIELD_NAME]: user.name ?? "고객",
          [KAKAO_TEMPLATE.FIELD_RESERVATION_DATE_FOR_CANCEL]: dayjs(reservation.datetime).format("MM-DD"),
          [KAKAO_TEMPLATE.FIELD_RESERVATION_TIME_FOR_CANCEL]: dayjs(reservation.datetime).format("A hh:mm"),
        })
      } else if (user.phoneNumber) {
        await this.smsService.sendCancelReservationSms(user.phoneNumber, reservation.datetime)
      }
    } catch (e) {
      console.error("[sendCancelReservationMessage] FAILED:", e?.message || e, JSON.stringify(e?.response?.data || ""))
    }
  }

  async sendRejectReservationMessage(reservation: Reservation) {
    try {
      const user = reservation.user
      const lang = user.languageLocale ?? I18nContext.current().lang
      if (user.email) {
        await this.sendSesEmail(
          user.email,
          this.i18n.t("MESSAGES.NOTIFICATION.SUBJECT_REJECTION", { lang }),
          this.i18n.t("MESSAGES.NOTIFICATION.RESERVATION_REJECTION", {
            lang,
            args: {
              name: user.name ?? "",
              date: dayjs(reservation.datetime).format("MM-DD"),
              time: dayjs(reservation.datetime).format("A hh:mm"),
            },
          }),
        )
      }
      if (user.phoneNumber && (user.phoneNumber.startsWith("+82") || user.provider == AuthProvider.KAKAO)) {
        await this.kakaoService.sendReservationRejectMessage([user.phoneNumber], {
          [KAKAO_TEMPLATE.FIELD_NAME]: user.name ?? "고객",
        })
      }
    } catch (e) {
      console.error("[sendRejectReservationMessage] FAILED:", e?.message || e, JSON.stringify(e?.response?.data || ""))
    }
  }

  async refreshAndFindReservation(query?: ReservationQueryDto, user?: User) {
    if (user !== undefined) {
      const accountUser = await this.userService.findOne(user.id)

      if (accountUser.customerNumber) {
        const smartDoctorReservations = await this.getSmartDoctorReservations(accountUser.customerNumber)

        const reservations = await this.repository.find({
          where: { status: ReservationStatus.DONE, user: { id: user.id } },
        })

        for (const reservation of reservations) {
          // 스마트닥터에서 동일 seqNo 예약 찾기
          const matchingSmart = smartDoctorReservations.find(
            (r: any) => String(r.id?.seqNo) === String(reservation.rid),
          )

          if (!matchingSmart) {
            // 스마트닥터에 존재하지 않으면 → 취소 처리
            reservation.rid = null
            reservation.status = ReservationStatus.CANCELED
            await this.repository.save(reservation)
            continue
          }

          // 스마트닥터에 존재하지만 label.name === "취소" → 취소 처리
          if (matchingSmart.label?.name === "취소") {
            reservation.status = ReservationStatus.CANCELED
            await this.repository.save(reservation)
            continue
          }

          // 스마트닥터에 존재할 경우, 날짜/시간 비교
          const newDateTime = new Date(`${matchingSmart.reservationDate}T${matchingSmart.reservationStartTime}`)
          const oldDateTime = new Date(reservation.datetime)

          // 날짜/시간이 다를 경우 업데이트
          if (newDateTime.getTime() !== oldDateTime.getTime()) {
            reservation.datetime = newDateTime
            reservation.status = ReservationStatus.DONE // 유지 혹은 DONE으로 복원
            await this.repository.save(reservation)
          }
        }
      }
    }

    return this.findManyWithPaginationQuery(query)
  }

  async getSmartDoctorReservations(customerNumber: string) {
    return await this.smartDoctorRepository.getCustomerReservations(customerNumber)
  }

  async findManyWithPaginationQuery(query?: ReservationQueryDto) {
    const findOptions = <FindManyOptions<Reservation>>{
      relations: ["user", "products", "products.product", "events", "events.event", "integratedCrmCategory"],
      where: {
        ...(query?.userId && { user: { id: query.userId } }),
        ...(query?.userName && { user: { name: ILike(`%${query.userName}%`) } }),
        ...(query?.userPhoneNumber && { user: { phoneNumber: ILike(`%${query.userPhoneNumber}%`) } }),
        ...(query?.datetimeBetween &&
          query?.datetimeBetween.length == 2 && {
            datetime: Between(new Date(query.datetimeBetween[0]), new Date(query.datetimeBetween[1])),
          }),
        ...(query?.createdAtBetween &&
          query?.createdAtBetween.length == 2 && {
            createdAt: Between(
              new Date(query.createdAtBetween[0]).toUTCString(),
              new Date(query.createdAtBetween[1]).toUTCString(),
            ),
          }),
        ...(query?.statusIn && { status: In(query.statusIn) }),
        ...(query?.building && { building: query.building }),
        ...(query?.pathVisit && { pathVisit: query.pathVisit }),
        ...(query?.detailVisit && { detailVisit: query.detailVisit }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<Reservation>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findOneWithEvents(id: string) {
    return this.repository.findOneOrFail({ relations: ["events", "events.event"], where: { id: id } })
  }

  async findByDatetime(datetime: Date) {
    return this.repository.find({ where: { datetime: datetime } })
  }

  async findNotCanceledByDatetime(datetime: Date) {
    return this.repository.find({
      where: { datetime: datetime, status: In([ReservationStatus.WAITING, ReservationStatus.DONE]) },
    })
  }

  async findNotCanceledByDatetimeAndCrmCategory(datetime: Date) {
    return this.repository.find({
      where: {
        datetime: datetime,
        status: In([ReservationStatus.WAITING, ReservationStatus.DONE]),
      },
    })
  }

  async checkExistDateByUser(datetime: Date, user: User) {
    const exists = await this.getExistDateByUser(datetime, user)
    if (exists) {
      throw new BadRequestException(`Reservation already exist ${datetime}`)
    }
  }

  async checkIsClosed(datetime: Date) {
    const isClosed = await this.closeDayService.checkIsCloseDay(datetime)
    if (isClosed) {
      throw new BadRequestException(`Reservation is closed`)
    }
  }

  // 예약 업데이트
  async update(id: string, dto: UpdateReservationDto, user?: User) {
    const reservation = await this.findOneWithEvents(id)
    let building: Building
    if (dto.datetime) {
      if (reservation.events && reservation.events.length > 0) {
        await this.checkAvailableEvent(
          reservation.events.map((event) => event.event.id),
          dto.datetime,
        )
      }
      building = Building.BUILDING_1
      const datetime = new Date(dto.datetime)
      dto.datetime = new Date(
        datetime.getFullYear(),
        datetime.getMonth(),
        datetime.getDate(),
        datetime.getHours(),
        datetime.getMinutes(),
        0,
      )
    } else {
      building = reservation.building
    }

    const saved = await this.repository.save(
      Object.assign(reservation, dto, {
        status: ReservationStatus.WAITING, // 예약 변경 '요청' 이기 때문에 WAITING 으로
        updatedBy: user?.id,
        ...(building && { building: building }),
      }),
    )
    // 팔레트 api 콜
    await this.updateReservationAndGetPlanId(reservation.palettePlanId, dto)

    // 예약 변경 후 메시지 전송
    const newReservation = await this.findOne(reservation.id)
    if (newReservation.status == ReservationStatus.WAITING) {
      await this.sendNewReservationMessage(newReservation)
    }
    return saved
  }

  async cancelReservation(reservation: Reservation) {
    await this.sendCancelReservationMessage(reservation)
    // await this.smartDoctorRepository.deleteReservation(reservation.user.customerNumber, reservation.rid)
  }

  async remove(id: string) {
    const reservation = await this.findOne(id)

    if (reservation.palettePlanId) {
      try {
        await this.doctorPaletteRepository.deletePlan(reservation.palettePlanId, {
          isNoShow: false,
          reason: "사용자 취소",
        })
      } catch (e) {
        console.error("Doctor Palette cancel failed:", e)
      }
    }
    // await this.repository.remove(reservation)
    if (reservation.status == ReservationStatus.DONE) {
      await this.cancelReservation(reservation)
    }
    reservation.status = ReservationStatus.CANCELED
    await this.repository.save(reservation)
  }

  async getDaysInMonth(year: number, month: number) {
    const date = new Date(year, month - 1, 1)
    const days = []
    while (date.getMonth() === month - 1) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    return days
  }

  async getAvailableReservationByDayAndIntegratedCrmCategory(day: Date) {
    const reservationSlots = await this.reservationSlotService.findByDay(day)
    const specificSlots = await this.specificDateService.findSlotsByDay(day)
    const availableSlots: AvailableReservationResultDto[] = []
    const date = new Date(day)

    // 특정 날짜 슬롯 처리
    if (specificSlots && specificSlots.length > 0) {
      for (const specificSlot of specificSlots) {
        const availableSlot = await this.processSlotAvailability(date, specificSlot)

        if (availableSlot) {
          availableSlots.push(availableSlot)
        }
      }
    }
    // 기본 예약 슬롯 처리
    else if (reservationSlots && reservationSlots.length > 0) {
      for (const reservationSlot of reservationSlots) {
        const availableSlot = await this.processSlotAvailability(date, reservationSlot)

        if (availableSlot) {
          availableSlots.push(availableSlot)
        }
      }
    }
    return availableSlots
  }

  async getAvailableReservationByMonth(dto: AvailableReservationByMonthDto, user: User) {
    this.checkAvailableDto(dto)
    const isProduct = !(dto.eventIds && dto.eventIds.length > 0)
    const integratedCrmCategory = isProduct
      ? await this.getFirstIntegratedCrmCategoryInProductIds(dto.productIds)
      : await this.getFirstIntegratedCrmCategoryInEventIds(dto.eventIds)
    user.locale = await this.getUserLanguage(user)
    const langCrmCategory = user.locale ? await this.getFirstCrmCategoryByLang(user.locale) : null
    const categoryGroup = langCrmCategory?.isActivated() ? langCrmCategory : integratedCrmCategory
    const days = await this.getDaysInMonth(dto.year, dto.month)
    const availableDays = []
    const events = isProduct ? undefined : await this.eventService.findManyByIds(dto.eventIds)
    for (const day of days) {
      const available = await this.getAvailableByDay(day, user)
      if (available && available.length > 0) {
        for (const availableTime of available) {
          if (isProduct) {
            availableDays.push(availableTime)
          } else {
            if (events && events.length > 0) {
              const isAvailable = this.hasAvailableEvent(availableTime, events)
              if (isAvailable) {
                availableDays.push(availableTime)
              }
            }
          }
        }
      }
    }
    return availableDays
  }

  // NEW 캘린더 조회때 사용
  async getAvailableReservationByDayFromDoctorPalette(dto: AvailableReservationByDayDto) {
    // 1. 닥터팔레트 schedule 슬롯 조회
    const date = `${String(dto.year)}-${String(dto.month).padStart(2, "0")}-${String(dto.day).padStart(2, "0")}`
    const slots = await this.doctorPaletteRepository.getScheduleSlots(date)

    // 2. enabled = true 인 슬롯만 필터링
    const availableSlots = slots.filter((s) => s.enabled)

    // 3. 프론트에서 원하는 형태로 변환
    return availableSlots.map((s) => ({
      datetime: s.dateTime,
      enabled: s.enabled,
    }))
  }

  // OLD 캘린더 조회때 사용
  async getAvailableReservationByDay(dto: AvailableReservationByDayDto, user: User) {
    this.checkAvailableDto(dto)
    user.locale = await this.getUserLanguage(user)
    const isProduct = !(dto.eventIds && dto.eventIds.length > 0)
    const day = new Date(dto.year, dto.month - 1, dto.day)
    const availableTimes = await this.getAvailableByDay(
      day,

      user,
    )

    const events = isProduct ? undefined : await this.eventService.findManyByIds(dto.eventIds)
    if (isProduct && availableTimes && availableTimes.length > 0) {
      return availableTimes.sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
    }
    if (!isProduct && events && events.length > 0) {
      const result = []
      for (const availableTime of availableTimes) {
        const isAvailable = this.hasAvailableEvent(availableTime, events)
        if (isAvailable) {
          result.push(availableTime)
        }
      }
      return result.sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
    }
    return []
  }

  async getReservationSlotsByMonth(dto: ReservationCountByMonthDto) {
    const days = await this.getDaysInMonth(dto.year, dto.month)
    const result = []
    const reservationSlots = await this.reservationSlotService.findAll()
    const building1CrmCodes = await this.integratedCrmCategoryService.getCrmCodesByBuilding(Building.BUILDING_1)
    const building2CrmCodes = await this.integratedCrmCategoryService.getCrmCodesByBuilding(Building.BUILDING_2)
    const building3CrmCodes = await this.integratedCrmCategoryService.getCrmCodesByBuilding(Building.BUILDING_3)
    const building1SmartDoctorReservationSlots = await this.smartDoctorRepository.getReservationCountsByMonth(
      dto.year,
      dto.month,
      building1CrmCodes,
    )
    const building2SmartDoctorReservationSlots = await this.smartDoctorRepository.getReservationCountsByMonth(
      dto.year,
      dto.month,
      building2CrmCodes,
    )
    const building3SmartDoctorReservationSlots = await this.smartDoctorRepository.getReservationCountsByMonth(
      dto.year,
      dto.month,
      building3CrmCodes,
    )
    for (const day of days) {
      const date = new Date(day)
      const isClosed = await this.closeDayService.checkIsCloseDay(day)
      const slots: ReservationCountByDatetimeResultDto[] = []
      if (!isClosed) {
        const specificSlots = await this.specificDateService.findSlotsByDay(day)
        if (specificSlots && specificSlots.length > 0) {
          for (const slot of specificSlots) {
            await this.processReservationSlot(
              date,
              slot,
              building1SmartDoctorReservationSlots,
              building2SmartDoctorReservationSlots,
              building3SmartDoctorReservationSlots,
              slots,
            )
          }
        } else {
          const reservationSlotsByDay = reservationSlots.filter(
            (reservationSlot) => reservationSlot.dayOfWeek == numberToDayOfWeekString(date.getDay()),
          )
          for (const slot of reservationSlotsByDay) {
            await this.processReservationSlot(
              date,
              slot,
              building1SmartDoctorReservationSlots,
              building2SmartDoctorReservationSlots,
              building3SmartDoctorReservationSlots,
              slots,
            )
          }
        }
      }
      result.push(Object.assign(new ReservationCountByDayResultDto(), { day: day, slots: slots, isClosed: isClosed }))
    }
    return result
  }

  private hasAvailableEvent(availableTime: AvailableReservationResultDto, events: Event[]) {
    const datetime = new Date(availableTime.datetime)
    let isAvailable = true
    events.forEach((event) => {
      if (!event.category.dayOfWeek.find((dayOfWeek) => dayOfWeek == datetime.getDay())) {
        isAvailable = false
      }
      if (
        (event.category.startHour && event.category.startMinute && datetime.getHours() < event.category.startHour) ||
        (event.category.endHour && event.category.endMinute && datetime.getHours() > event.category.endHour)
      ) {
        isAvailable = false
      }
      if (event.category.startDate) {
        const startDate = new Date(event.category.startDate)
        startDate.setHours(0, 0, 0, 0)
        if (datetime.getTime() < startDate.getTime()) {
          isAvailable = false
        }
      }
      if (event.category.endDate) {
        const endDate = new Date(event.category.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (datetime.getTime() > endDate.getTime()) {
          isAvailable = false
        }
      }
      if (event.bundle.startDate) {
        const startDate = new Date(event.bundle.startDate)
        startDate.setHours(0, 0, 0, 0)
        if (datetime.getTime() < startDate.getTime()) {
          isAvailable = false
        }
      }
      if (event.bundle.endDate) {
        const endDate = new Date(event.bundle.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (datetime.getTime() > endDate.getTime()) {
          isAvailable = false
        }
      }
    })
    return isAvailable
  }

  private async processReservationSlot(
    date: Date,
    slot: ReservationSlot | SpecificDateSlot,
    building1SmartDoctorReservationSlots: SmartDoctorReservationCountDto[],
    building2SmartDoctorReservationSlots: SmartDoctorReservationCountDto[],
    building3SmartDoctorReservationSlots: SmartDoctorReservationCountDto[],
    slots: ReservationCountByDatetimeResultDto[],
  ) {
    const datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), slot.hour, slot.minutes, 0)
    const reservations = await this.findByDatetime(datetime)
    const smartDoctorReservationCount = this.getSmartDoctorReservationSlot(
      building1SmartDoctorReservationSlots,
      building2SmartDoctorReservationSlots,
      building3SmartDoctorReservationSlots,
      datetime,
      slot.building,
    )
    const reservationCount = this.getReservationCountFromReservations(
      reservations,
      slot.building,
      smartDoctorReservationCount,
    )
    const waitingReservationCount = this.getWaitingReservationCountFromReservations(reservations, slot.building)
    slots.push(
      Object.assign(new ReservationCountByDatetimeResultDto(), {
        datetime: datetime,
        building: slot.building,
        reservationCount: reservationCount,
        waitingReservationCount: waitingReservationCount,
        maxSlot: slot.maxSlot,
      }),
    )
  }

  /**
   * 단일 시간 슬롯에 대한 가용성 확인 및 결과 생성
   */
  private async processSlotAvailability(
    date: Date,
    slot: SpecificDateSlot | ReservationSlot,
  ): Promise<AvailableReservationResultDto | null> {
    // 슬롯 최대값이 0 이하인 경우 예약 불가 처리
    if (slot.maxSlot <= 0) {
      return null
    }

    const datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), slot.hour, slot.minutes, 0)

    const building = await this.getAvailable(datetime)

    if (building == slot.building) {
      return Object.assign(new AvailableReservationResultDto(), { datetime: datetime, building: building })
    }

    return null
  }

  private async sendSesEmail(email: string, subject: string, body: string) {
    try {
      return await this.sesService.sendSesEmail(email, subject, body)
    } catch (e) {
      console.log("Error sending email")
    }
  }

  private dayRange(day?: Date) {
    const date = day ? new Date(day) : new Date()
    const startDatetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    const endDatetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
    return { startDatetime, endDatetime }
  }

  private async getExistDateByUser(datetime: Date, user: User) {
    const { startDatetime, endDatetime } = this.dayRange(datetime)
    return await this.repository.exist({
      where: {
        user: { id: user.id },
        datetime: Between(startDatetime, endDatetime),
        status: In([ReservationStatus.WAITING, ReservationStatus.DONE]),
      },
    })
  }

  private async getFirstIntegratedCrmCategoryInProductIds(productIds: string[]) {
    const products = await this.productService.findManyByIds(productIds)
    const product = products.reduce((prev, curr) =>
      (prev.integratedCrmCategory?.order ?? 0) < (curr.integratedCrmCategory?.order ?? 0) ? prev : curr,
    )
    if (
      !product ||
      !product.integratedCrmCategory?.building1CrmCategory ||
      !product.integratedCrmCategory?.building2CrmCategory ||
      !product.integratedCrmCategory?.building3CrmCategory
    ) {
      throw new BadRequestException(`Product not found`)
    }
    return product?.integratedCrmCategory
  }

  // 상품의 통합CRM대분류를 판단. 필요없음.
  private async getFirstIntegratedCrmCategoryInEventIds(eventIds: string[]) {
    const events = await this.eventService.findManyByIds(eventIds)
    const event = events.reduce((prev, curr) =>
      (prev.integratedCrmCategory?.order ?? 0) < (curr.integratedCrmCategory?.order ?? 0) ? prev : curr,
    )
    if (
      !event ||
      !event.integratedCrmCategory?.building1CrmCategory ||
      !event.integratedCrmCategory?.building2CrmCategory ||
      !event.integratedCrmCategory?.building3CrmCategory
    ) {
      throw new BadRequestException(`Product not found`)
    }
    return event?.integratedCrmCategory
  }

  private async getBuildingByTotalSlots(
    datetime: Date,
    reservations: Reservation[],
  ): Promise<{ buildings: Building[]; specificSlots: SpecificDateSlot[] }> {
    const specificSlots = await this.specificDateService.findSlotsByDatetime(datetime)
    const reservationSlots = await this.reservationSlotService.findByDatetime(datetime)
    const building1WaitingReservationCount = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_1 && reservation.status == ReservationStatus.WAITING,
    ).length
    const building2WaitingReservationCount = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_2 && reservation.status == ReservationStatus.WAITING,
    ).length
    const building3WaitingReservationCount = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_3 && reservation.status == ReservationStatus.WAITING,
    ).length
    const building1DoneReservationCount = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_1 && reservation.status == ReservationStatus.DONE,
    ).length
    const building2DoneReservationCount = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_2 && reservation.status == ReservationStatus.DONE,
    ).length
    const building3DoneReservationCount = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_3 && reservation.status == ReservationStatus.DONE,
    ).length
    const building1TotalReservationCount = this.totalReservationCount(
      building1DoneReservationCount,
      building1WaitingReservationCount,
    )
    const building2TotalReservationCount = this.totalReservationCount(
      building2DoneReservationCount,
      building2WaitingReservationCount,
    )
    const building3TotalReservationCount = this.totalReservationCount(
      building3DoneReservationCount,
      building3WaitingReservationCount,
    )
    const buildingTotalReservationCountMap = {
      [Building.BUILDING_1]: building1TotalReservationCount,
      [Building.BUILDING_2]: building2TotalReservationCount,
      [Building.BUILDING_3]: building3TotalReservationCount,
    }
    const availableBuildings = []
    if (specificSlots && specificSlots.length > 0) {
      const availableBuilding = this.getAvailableBuildingSlotOrNull(
        specificSlots,
        Building.BUILDING_1,
        buildingTotalReservationCountMap[Building.BUILDING_1],
      )
      if (availableBuilding) {
        availableBuildings.push(availableBuilding)
      }
    } else if (reservationSlots && reservationSlots.length > 0) {
      const availableBuilding = this.getAvailableBuildingSlotOrNull(
        reservationSlots,
        Building.BUILDING_1,
        buildingTotalReservationCountMap[Building.BUILDING_1],
      )
      if (availableBuilding) {
        availableBuildings.push(availableBuilding)
      }
    }
    return { buildings: availableBuildings, specificSlots }
  }

  private getAvailableBuildingSlotOrNull(
    slots: Array<SpecificDateSlot | ReservationSlot>,
    building: Building,
    buildingsTotalReservedCnt: number,
  ) {
    const priorSlots = slots.filter((slot) => slot.building == building)
    if (priorSlots && priorSlots.length > 0) {
      if (priorSlots[0].maxSlot > 0 && priorSlots[0].maxSlot > buildingsTotalReservedCnt) {
        return building
      }
    }
    return null
  }

  // 데이터베이스 데이터만 더하면 됨
  private totalReservationCount(doneReservationCnt: number, waitingReservationCnt: number) {
    return doneReservationCnt + waitingReservationCnt
  }

  private async getBuildingByIntegratedCrmCategory(
    specificSlots: SpecificDateSlot[],
    reservations: Reservation[],
  ): Promise<Building | null> {
    const building1WaitingReservationCountByCrmCategory = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_1 && reservation.status == ReservationStatus.WAITING,
    ).length
    const building2WaitingReservationCountByCrmCategory = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_2 && reservation.status == ReservationStatus.WAITING,
    ).length
    const building3WaitingReservationCountByCrmCategory = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_3 && reservation.status == ReservationStatus.WAITING,
    ).length
    const building1DoneReservationCountByCrmCategory = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_1 && reservation.status == ReservationStatus.DONE,
    ).length
    const building2DoneReservationCountByCrmCategory = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_2 && reservation.status == ReservationStatus.DONE,
    ).length
    const building3DoneReservationCountByCrmCategory = reservations.filter(
      (reservation) => reservation.building == Building.BUILDING_3 && reservation.status == ReservationStatus.DONE,
    ).length
    const building1TotalReservationCountByCrmCategory =
      building1DoneReservationCountByCrmCategory + building1WaitingReservationCountByCrmCategory
    const building2TotalReservationCountByCrmCategory =
      building2DoneReservationCountByCrmCategory + building2WaitingReservationCountByCrmCategory
    const building3TotalReservationCountByCrmCategory =
      building3DoneReservationCountByCrmCategory + building3WaitingReservationCountByCrmCategory
    const totalReservationCountByCrmCategoryMap = {
      [Building.BUILDING_1]: building1TotalReservationCountByCrmCategory,
      [Building.BUILDING_2]: building2TotalReservationCountByCrmCategory,
      [Building.BUILDING_3]: building3TotalReservationCountByCrmCategory,
    }
    // 우선순위 검사 -> CRM대분류에 지정된 슬롯수하고 DB에 저장된 예약수를 비교. -> 필요없음.
    const crmCategoryMaxSlot = 0
    const building = Building.BUILDING_1
    // (여기서 특정일 예약시간일 경우 특정일의 maxSlot 검사 필요)
    if (specificSlots && specificSlots.length > 0) {
      const matchedSlot = specificSlots.find((slot) => slot.building === building)
      if (matchedSlot && matchedSlot.maxSlot > totalReservationCountByCrmCategoryMap[building]) {
        if (crmCategoryMaxSlot && crmCategoryMaxSlot > totalReservationCountByCrmCategoryMap[building]) {
          return building
        }
      }
    } else if (crmCategoryMaxSlot && crmCategoryMaxSlot > totalReservationCountByCrmCategoryMap[building]) {
      return building
    }

    // 모든 우선순위 건물이 가득 찬 경우
    return null
  }

  private async checkAvailableAndGetBuilding(datetime: Date, categoryGroup: CategoryGroup, user: User) {
    await this.checkExistDateByUser(datetime, user)
    await this.checkIsClosed(datetime)

    const reservations = await this.findNotCanceledByDatetime(datetime)

    const reservationsByCrmCategory = await this.findNotCanceledByDatetimeAndCrmCategory(datetime)
    const buildingByTotalSlots = await this.getBuildingByTotalSlots(datetime, reservations)
    if (!buildingByTotalSlots.buildings || buildingByTotalSlots.buildings.length == 0) {
      throw new BadRequestException(`Reservation is full.`)
    }

    // 언어 기반 우선순위 또는 통합 CRM 카테고리 기반 건물 결정
    const buildingByCategory = await this.getBuildingByIntegratedCrmCategory(
      buildingByTotalSlots.specificSlots,
      reservationsByCrmCategory,
    )

    if (!buildingByCategory) {
      throw new BadRequestException(`Reservation is full..`)
    }
    if (buildingByTotalSlots.buildings.includes(buildingByCategory)) {
      return buildingByCategory
    } else {
      throw new BadRequestException(`Reservation is full...`)
    }
  }

  private async getFirstCrmCategoryByLang(userLanguage: LanguageLocale): Promise<LangCrmCategory | null> {
    const langCrmCategories = await this.langCrmCategoryService.findByLang(userLanguage)
    return langCrmCategories && langCrmCategories.length > 0 ? langCrmCategories[0] : null
  }

  private async getUserLanguage(user: User): Promise<LanguageLocale> {
    // Case 1: already has locale (from JWT or frontend)
    if (user.locale) {
      return user.locale as LanguageLocale
    }

    // Case 2: fall back to i18n context
    const currentLang = this.getCurrentLang()

    if (currentLang) {
      return currentLang
    }

    // Case 3: fallback to user's DB record
    const foundUser = await this.userService.findOne(user.id)
    return (
      foundUser.languageLocale ?? LanguageLocale.ko // default fallback if still undefined
    )
  }

  private getCurrentLang() {
    try {
      const lang = I18nContext.current().lang

      // normalize keys for enums that use different naming
      if (lang === "zh-TW") return LanguageLocale.zhTW

      return LanguageLocale[lang as keyof typeof LanguageLocale] ?? null
    } catch (e) {
      return null
    }
  }

  private async getAvailable(datetime: Date): Promise<Building | null> {
    const reservations = await this.findNotCanceledByDatetime(datetime)
    const reservationsByCrmCategory = await this.findNotCanceledByDatetimeAndCrmCategory(datetime)

    // 슬롯 기준 가용 건물 확인
    const buildingByTotalSlots = await this.getBuildingByTotalSlots(datetime, reservations)

    // 가용 건물 있으면 해당 건물 반환
    for (const building of buildingByTotalSlots.buildings) {
      if (building) {
        return building
      }
    }

    // 슬롯 기준 가용 건물이 없으면 null 반환
    return null
  }

  private checkDto(dto: ReservationDto) {
    if (
      (dto.productIds == undefined || dto.productIds.length == 0) &&
      (dto.eventIds == undefined || dto.eventIds.length == 0)
    ) {
      throw new BadRequestException(`Reservation must have productIds or eventIds`)
    }
  }

  private checkAvailableDto(dto: AvailableReservationDto) {
    if (
      (dto.productIds == undefined || dto.productIds.length == 0) &&
      (dto.eventIds == undefined || dto.eventIds.length == 0)
    ) {
      throw new BadRequestException(`Reservation must have productIds or eventIds`)
    }
  }

  /**
   * 사용자별 제한 검증: 해당 사용자가 이미 지정된 날짜에 예약이 있는지 확인
   * @param day 확인할 날짜
   * @param user 사용자
   * @returns 사용자가 해당 날짜에 예약 가능한지 여부 (true: 가능, false: 불가능)
   */
  private async validateUserCanReserveOnDay(day: Date, user: User): Promise<boolean> {
    const exists = await this.getExistDateByUser(day, user)
    return !exists // 예약이 없으면 true, 있으면 false 반환
  }

  /**
   * 전체 제한 검증: 지정된 날짜가 휴무일인지 확인
   * @param day 확인할 날짜
   * @returns 예약 가능한 날짜인지 여부 (true: 가능, false: 불가능)
   */
  private async validateDayIsAvailable(day: Date): Promise<boolean> {
    const isClosed = await this.closeDayService.checkIsCloseDay(day)
    return !isClosed // 휴무일이 아니면 true, 휴무일이면 false 반환
  }

  /**
   * 지정된 날짜에 사용 가능한 예약 시간을 조회
   * 1. 휴무일 여부 검증
   * 2. 사용자별 예약 제한 검증
   * 3. 사용 가능한 예약 시간 조회
   */
  private async getAvailableByDay(
    day: Date,
    // categoryGroup: CategoryGroup,
    user: User,
  ) {
    // 1. 휴무일 여부 검증 (더 가벼운 연산이므로 먼저 수행)
    const dayIsAvailable = await this.validateDayIsAvailable(day)
    if (!dayIsAvailable) {
      return [] // 휴무일이라 예약 불가능
    }

    // 2. 사용자별 예약 제한 검증
    const userCanReserve = await this.validateUserCanReserveOnDay(day, user)
    if (!userCanReserve) {
      return [] // 사용자가 이미 해당 날짜에 예약이 있음
    }

    // 3. 사용 가능한 예약 시간 조회
    return await this.getAvailableReservationByDayAndIntegratedCrmCategory(day)
  }

  private getReservationCountFromReservations(
    reservations: Reservation[],
    building: Building,
    smartDoctorReservationCount?: number,
  ) {
    const waitingReservationsCount = reservations.filter(
      (reservation) => reservation.building == building && reservation.status == ReservationStatus.WAITING,
    ).length
    const doneReservationsCount = reservations.filter(
      (reservation) => reservation.building == building && reservation.status == ReservationStatus.DONE,
    ).length
    return (
      waitingReservationsCount +
      (smartDoctorReservationCount && smartDoctorReservationCount > doneReservationsCount
        ? smartDoctorReservationCount
        : doneReservationsCount)
    )
  }

  private getWaitingReservationCountFromReservations(reservations: Reservation[], building: Building) {
    return reservations
      ? reservations.filter(
          (reservation) => reservation.building == building && reservation.status == ReservationStatus.WAITING,
        ).length
      : 0
  }

  private async getCustomerNumber(user: User) {
    const accountUser = await this.userService.findOne(user.id)
    let customerNumber = accountUser.customerNumber
    if (customerNumber == undefined) {
      customerNumber = await this.smartDoctorRepository.getCustomer(accountUser)
      if (customerNumber == undefined) {
        customerNumber = await this.smartDoctorRepository.postCustomer(accountUser)
      }
      await this.userService.updateCustomerNumber(user.id, customerNumber)
    }
    return customerNumber
  }

  private async getCustomerName(user: User) {
    const accountUser = await this.userService.findOne(user.id)
    return accountUser.name
  }

  private async getCustomerId(user: User) {
    const accountUser = await this.userService.findOne(user.id)
    return accountUser.id
  }

  private async getCustomerPhone(user: User) {
    const accountUser = await this.userService.findOne(user.id)
    return accountUser.phoneNumber
  }

  private async getCustomerEmail(user: User) {
    const accountUser = await this.userService.findOne(user.id)
    return accountUser.email
  }

  // 닥터 팔레트 예약(플랜) 생성
  private async postReservationAndGetPlanId(
    customerName: string,
    customerId: string,
    phone: string,
    dto: CreateReservationDto,
    eventNames: [],
    productNames: [],
  ) {
    return await this.doctorPaletteRepository.createPlan(customerName, customerId, phone, dto, eventNames, productNames)
  }

  // 닥터 팔레트 예약(플랜) 수정
  private async updateReservationAndGetPlanId(planId: string, dto: UpdateReservationDto) {
    // 전달할 payload 생성 (닥터팔레트는 REQUESTED/CONFIRMED만 허용)
    const payload: any = {}

    // dateTime 수정 시 팔레트 포맷 적용
    if (dto.datetime) {
      payload.dateTime = this.formatPaletteDateTime(dto.datetime)
    }

    // 내부는 WAITING이지만, 팔레트에는 REQUESTED로 통일
    payload.status = "REQUESTED"

    // 메모가 있을 경우
    if (dto.userMemo) {
      payload.requestMessage = dto.userMemo
    }

    return await this.doctorPaletteRepository.updatePlan(planId, payload)
  }

  // yyyy-MM-ddTHH:mm:00 형태로 변환
  private formatPaletteDateTime(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    const h = String(date.getHours()).padStart(2, "0")
    const min = String(date.getMinutes()).padStart(2, "0")
    return `${y}-${m}-${d}T${h}:${min}:00`
  }

  private async postReservationAndGetRid(
    customerNumber: string,
    crmCode: string,
    dto: CreateReservationDto,
    building: Building,
  ) {
    return await this.smartDoctorRepository.postReservation(
      customerNumber,
      crmCode,
      dto.datetime,
      dto.userMemo,
      dto.adminMemo,
      building,
    )
  }

  private async checkAvailableEvent(eventIds: string[], datetime: Date) {
    if (eventIds && eventIds.length > 0) {
      const events = await this.eventService.checkAvailableEvents(eventIds, datetime)
      if (!events || events.length < eventIds.length) {
        throw new BadRequestException(`Event is not available`)
      }
    }
  }

  private getSmartDoctorReservationSlot(
    building1SmartDoctorReservationSlots: SmartDoctorReservationCountDto[],
    building2SmartDoctorReservationSlots: SmartDoctorReservationCountDto[],
    building3SmartDoctorReservationSlots: SmartDoctorReservationCountDto[],
    datetime: Date,
    building: Building,
  ) {
    let smartDoctorReservationSlots: SmartDoctorReservationCountDto[]
    if (building == Building.BUILDING_1) {
      smartDoctorReservationSlots = building1SmartDoctorReservationSlots
    } else if (building == Building.BUILDING_2) {
      smartDoctorReservationSlots = building2SmartDoctorReservationSlots
    } else {
      smartDoctorReservationSlots = building3SmartDoctorReservationSlots
    }
    const slot = smartDoctorReservationSlots.find(
      (reservationSlot) =>
        reservationSlot.reservationDate == datetime.toISOString().split("T")[0] &&
        reservationSlot.reservationTime ==
          `${datetime.getUTCHours()}:${datetime.getUTCMinutes() != 0 ? datetime.getUTCMinutes() : "00"}:00`,
    )
    return slot?.count
  }
}
