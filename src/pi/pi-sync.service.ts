import { Injectable, Logger } from "@nestjs/common"
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm"
import { DataSource, Repository } from "typeorm"
import { BlogSiteConfig, SiteSocialLink } from "@root/blog-v2/entities/site-config.entity"
import { BlogSiteConfigI18n } from "@root/blog-v2/entities/site-config-i18n.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import type { Product } from "@root/product/entities/product.entity"
import type { ProductCategory } from "@root/product/entities/product-category.entity"
import type { EventBundle } from "@root/event/entities/event-bundle.entity"
import { ProductCategoryStatus } from "@root/shared/enum/product"
import { PiClientService } from "./pi-client.service"
import { PiCatalog, catalogChanged, catalogCounts, catalogOf } from "./pi-catalog.util"
import {
  PECHE_LOCATION_KEY,
  PI_LANG_OF_SITE,
  PiBookingSettings,
  PiLocationPayload,
  PiSnsByLang,
  PiSnsLink,
  SyncDoctor,
  bookingSettingsChanged,
  bookingUrlOf,
  cleanText,
  pecheHoursToPI,
  planSync,
  reservationNoticeOf,
} from "./pi-sync.util"

// 사이트 내부 언어 코드 → PI 언어 코드(정본은 pi-sync.util — 예약 설정과 같은 표).
const SNS_LANGS = PI_LANG_OF_SITE

/** SNS 1건 → PI 링크. 링크 대신 QR 이미지로 뜨는 항목(위챗)은 image_url로 — 챗봇이 그 이미지를 안내한다. */
function toPiLink(l: SiteSocialLink): PiSnsLink | null {
  const url = (l.url || "").trim() || null
  const image = l.isModal && l.modalImageUrl ? String(l.modalImageUrl).trim() : ""
  if (!url && !image) return null
  return image ? { platform: l.platform, url, image_url: image } : { platform: l.platform, url }
}
/** 노출 SNS만(링크 또는 QR 이미지 있는 것) order순 */
function activeSns(links?: SiteSocialLink[]): PiSnsLink[] {
  return (links || [])
    .filter((l) => l.enabled)
    .sort((a, b) => a.order - b.order)
    .map(toPiLink)
    .filter((l): l is PiSnsLink => l !== null)
}
/** 대표(isPrimary) SNS 1개 — 공식채널 안내용 */
function primarySns(links?: SiteSocialLink[]): PiSnsLink | null {
  const p = (links || []).find((l) => l.isPrimary && l.enabled)
  return p ? toPiLink(p) : null
}

const SITE = "peche"

/**
 * 페슈 데이터(사이트 기본정보 + 의료진) → PI(챗봇) facts 동기화 오케스트레이터.
 * getFacts → planSync(diff) → executePlan. PI 미설정(env 미설정) 시 no-op.
 * 저장 흐름(의료진/사이트정보 저장)에서 best-effort로 호출된다.
 */
@Injectable()
export class PiSyncService {
  private readonly logger = new Logger(PiSyncService.name)

  constructor(
    private readonly pi: PiClientService,
    @InjectRepository(BlogSiteConfig) private readonly configRepo: Repository<BlogSiteConfig>,
    @InjectRepository(BlogSiteConfigI18n) private readonly i18nRepo: Repository<BlogSiteConfigI18n>,
    @InjectRepository(BlogDoctor) private readonly doctorRepo: Repository<BlogDoctor>,
    // 상품·분류·번들은 엔티티 이름으로 레포를 얻는다(클래스 import 금지 — pi.module 주석).
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  private get productRepo(): Repository<Product> {
    return this.dataSource.getRepository<Product>("Product")
  }
  private get categoryRepo(): Repository<ProductCategory> {
    return this.dataSource.getRepository<ProductCategory>("ProductCategory")
  }
  private get bundleRepo(): Repository<EventBundle> {
    return this.dataSource.getRepository<EventBundle>("EventBundle")
  }

  /** 언어별 SNS 묶음 — ko는 base, 나머지는 i18n(없으면 ko 폴백). 대표(primary) + 전체(channels). */
  private async buildSnsByLang(base?: BlogSiteConfig): Promise<PiSnsByLang> {
    const i18ns = await this.i18nRepo.find({ where: { targetSite: SITE } })
    const byLang: Record<string, SiteSocialLink[] | undefined> = { ko: base?.socialLinks }
    i18ns.forEach((row) => {
      if (row.socialLinks && row.socialLinks.length > 0) byLang[row.lang] = row.socialLinks
    })
    const out: PiSnsByLang = {}
    Object.entries(SNS_LANGS).forEach(([siteLang, piLang]) => {
      const links = byLang[siteLang] && byLang[siteLang]!.length > 0 ? byLang[siteLang] : base?.socialLinks
      out[piLang] = { primary: primarySns(links), channels: activeSns(links) }
    })
    return out
  }

  /** 사이트 기본정보(공통 ko 행 + 언어별 i18n) → PI location 1건 */
  private async buildLocation(): Promise<PiLocationPayload> {
    const cfg = await this.configRepo.findOne({ where: { targetSite: SITE } })
    const kakaoLink = (cfg?.socialLinks || []).find((l) => l.platform === "kakao" && l.enabled)?.url
    const kakaoUrl =
      kakaoLink || (cfg?.primaryConsultPlatform === "kakao" ? cfg?.primaryConsultUrl || "" : "")
    const mapLinks: { naver?: string; google?: string; kakao?: string } = {}
    if (cfg?.naverPlaceUrl) mapLinks.naver = cfg.naverPlaceUrl
    if (cfg?.googlePlaceUrl) mapLinks.google = cfg.googlePlaceUrl
    if (cfg?.kakaoPlaceUrl) mapLinks.kakao = cfg.kakaoPlaceUrl
    return {
      key: PECHE_LOCATION_KEY,
      name: (cfg?.hospitalName || "페슈의원").trim(),
      address: String(cfg?.displayAddress || "").replace(/\n/g, " ").trim(),
      phone: String(cfg?.telephone || "").trim(),
      hours: pecheHoursToPI({
        weekdayHours: cfg?.weekdayHours,
        weekendHours: cfg?.weekendHours,
        lunchInfo: cfg?.lunchInfo,
      }),
      parking: cleanText(cfg?.parkingInfo),
      // 예약 페이지는 사이트 주소에서 만든다(PI에 손으로 넣어 둔 값이 남지 않게).
      booking_url: bookingUrlOf(cfg?.baseUrl),
      kakao_url: kakaoUrl,
      place_url: String(cfg?.naverPlaceUrl || "").trim(),
      map_links: Object.keys(mapLinks).length ? mapLinks : undefined,
      common_sns: activeSns(cfg?.commonSocialLinks),
      sns_by_lang: await this.buildSnsByLang(cfg || undefined),
    }
  }

  /** 노출 중인 ko 의료진 → PI practitioner 소스(등록순) */
  private async buildDoctors(): Promise<SyncDoctor[]> {
    const docs = await this.doctorRepo.find({
      where: { targetSite: SITE, lang: "ko", isVisible: true },
      order: { createdAt: "ASC" },
    })
    return docs.map((d) => ({
      id: d.id,
      name: d.name,
      jobTitle: d.jobTitle,
      specialty: d.specialty,
      photoUrl: d.photoUrl,
      bio: d.bio,
    }))
  }

  /** 예약 설정(PI booking-settings) — 기본(ko) + 언어별 행의 예약 안내 문구 중 켠 언어만. */
  private async buildBookingSettings(): Promise<PiBookingSettings> {
    const base = await this.configRepo.findOne({ where: { targetSite: SITE } })
    const i18ns = await this.i18nRepo.find({ where: { targetSite: SITE } })
    return { reservation_notice: reservationNoticeOf(base, i18ns) }
  }

  /** 예약 설정 전송 — PI 값과 같으면 건너뛴다. 반환: 보냈는지. */
  private async syncBookingSettings(): Promise<boolean> {
    const local = await this.buildBookingSettings()
    const current = await this.pi.getBookingSettings()
    if (!bookingSettingsChanged(local, current)) {
      this.logger.log("PI 예약 설정 변경 없음")
      return false
    }
    await this.pi.putBookingSettings(local)
    this.logger.log("PI 예약 설정 반영(reservation_notice)")
    return true
  }

  /**
   * 시술·이벤트 카탈로그(PI catalog) — 상품 전부(노출 여부 포함)·ACTIVE 분류와 그 상세페이지·번들 전부(게시 기간 판정은 pi가 답할 때).
   * 사이트 공개 API가 주던 것과 같은 집합이다(`products?limit=1000`·`product-categories`·번들).
   */
  private async buildCatalog(): Promise<PiCatalog> {
    const [categories, products, bundles] = await Promise.all([
      this.categoryRepo.find({ where: { status: ProductCategoryStatus.ACTIVE }, relations: ["detailPages"], order: { order: "ASC" } }),
      this.productRepo.find(), // category·detailPage는 eager
      this.bundleRepo.find({ order: { order: "ASC" } }), // events eager(category·detailPage eager)
    ])
    return catalogOf({ categories, products, bundles })
  }

  /** 카탈로그 전송 — PI 값과 같으면 건너뛴다. 반환: 보냈는지. */
  private async syncCatalog(): Promise<boolean> {
    const local = await this.buildCatalog()
    const current = await this.pi.getCatalog()
    if (!catalogChanged(local, current)) {
      this.logger.log("PI 카탈로그 변경 없음")
      return false
    }
    const r = await this.pi.putCatalog(local)
    const n = catalogCounts(local)
    this.logger.log(`PI 카탈로그 반영(changed=${r.changed}): 묶음 ${n.groups}·상품 ${n.services}·번들 ${n.bundles}·이벤트 ${n.events}`)
    return r.changed
  }

  /**
   * 미리보기(실행 없이 계획만). PI 미설정이어도 '무엇을 보낼지'(location/doctors payload)는 보여준다.
   * (미설정 시 facts는 빈 것으로 간주 → 전부 신규 생성 계획으로 표시)
   */
  async preview() {
    const enabled = this.pi.enabled()
    const facts = enabled ? await this.pi.getFacts() : { locations: [], practitioners: [] }
    const location = await this.buildLocation()
    const doctors = await this.buildDoctors()
    const { ops, warnings } = planSync(location, doctors, facts)
    const bookingSettings = await this.buildBookingSettings()
    // PI 값과 다른지(보낼지). 미설정이거나 조회 실패면 null — 미리보기를 막지 않는다.
    let bookingSettingsWillUpdate: boolean | null = null
    if (enabled) {
      try {
        bookingSettingsWillUpdate = bookingSettingsChanged(bookingSettings, await this.pi.getBookingSettings())
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.logger.warn(`PI 예약 설정 조회 실패(미리보기): ${(e as any)?.piMessage || (e as any)?.message}`)
      }
    }
    const catalog = await this.buildCatalog()
    let catalogWillUpdate: boolean | null = null
    if (enabled) {
      try {
        catalogWillUpdate = catalogChanged(catalog, await this.pi.getCatalog())
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.logger.warn(`PI 카탈로그 조회 실패(미리보기): ${(e as any)?.piMessage || (e as any)?.message}`)
      }
    }
    return {
      enabled,
      location,
      doctors,
      ops,
      warnings,
      bookingSettings,
      bookingSettingsWillUpdate,
      catalog: catalogCounts(catalog),
      catalogWillUpdate,
    }
  }

  /**
   * 실제 동기화. PI 미설정 시 skip. 변경 없으면 no-op.
   * 단계: ① 지점·의료진(facts) ② 예약 설정 ③ 시술·이벤트 카탈로그. 세 단계는 서로를 막지 않는다 —
   * ②·③ 실패는 로그만, ① 실패는 ②·③을 마친 뒤 종전처럼 던진다.
   */
  async syncNow(): Promise<{
    enabled: boolean
    executed: number
    warnings: unknown[]
    bookingSettings?: "updated" | "unchanged" | "failed"
    catalog?: "updated" | "unchanged" | "failed"
  }> {
    if (!this.pi.enabled()) return { enabled: false, executed: 0, warnings: [] }
    let factsError: unknown = null
    let executed = 0
    let warnings: unknown[] = []
    try {
      const facts = await this.pi.getFacts()
      const location = await this.buildLocation()
      const doctors = await this.buildDoctors()
      const plan = planSync(location, doctors, facts)
      warnings = plan.warnings
      if (plan.ops.length > 0) await this.pi.executePlan(plan.ops, facts)
      executed = plan.ops.length
    } catch (e) {
      factsError = e
    }
    let bookingSettings: "updated" | "unchanged" | "failed"
    try {
      bookingSettings = (await this.syncBookingSettings()) ? "updated" : "unchanged"
    } catch (e) {
      bookingSettings = "failed"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.warn(`PI 예약 설정 동기화 실패: ${(e as any)?.piMessage || (e as any)?.message}`)
    }
    let catalog: "updated" | "unchanged" | "failed"
    try {
      catalog = (await this.syncCatalog()) ? "updated" : "unchanged"
    } catch (e) {
      catalog = "failed"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.warn(`PI 카탈로그 동기화 실패: ${(e as any)?.piMessage || (e as any)?.message}`)
    }
    if (factsError) throw factsError
    return { enabled: true, executed, warnings, bookingSettings, catalog }
  }

  /**
   * 저장 흐름에서 부르는 best-effort 트리거. PI 실패가 어드민 저장을 막지 않도록 에러를 삼키고 로그만 남긴다.
   * (엄격한 롤백이 필요하면 추후 저장 트랜잭션 안에서 syncNow를 호출하도록 설계)
   */
  async syncSafe(context: string): Promise<void> {
    if (!this.pi.enabled()) return
    try {
      const r = await this.syncNow()
      if (r.executed > 0 || r.bookingSettings === "updated" || r.catalog === "updated")
        this.logger.log(`PI 동기화(${context}): 사실 ${r.executed}건 · 예약 설정 ${r.bookingSettings} · 카탈로그 ${r.catalog}`)
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.warn(`PI 동기화 실패(${context}): ${(e as any)?.piMessage || (e as any)?.message}`)
    }
  }
}
