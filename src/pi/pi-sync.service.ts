import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogSiteConfig, SiteSocialLink } from "@root/blog-v2/entities/site-config.entity"
import { BlogSiteConfigI18n } from "@root/blog-v2/entities/site-config-i18n.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { PiClientService } from "./pi-client.service"
import {
  PECHE_LOCATION_KEY,
  PiLocationPayload,
  PiSnsByLang,
  PiSnsLink,
  SyncDoctor,
  cleanText,
  pecheHoursToPI,
  planSync,
} from "./pi-sync.util"

// PI에 보낼 언어(내부 코드). 번체는 zh-TW.
const SNS_LANGS = ["ko", "en", "zh", "ja", "th", "zh-TW"]

/** 노출 SNS만(링크 있거나 wechat) order순 → {platform,url} */
function activeSns(links?: SiteSocialLink[]): PiSnsLink[] {
  return (links || [])
    .filter((l) => l.enabled && (!!l.url || l.platform === "wechat"))
    .sort((a, b) => a.order - b.order)
    .map((l) => ({ platform: l.platform, url: l.url || "" }))
}
/** 대표(isPrimary) SNS 1개 — 공식채널 안내용 */
function primarySns(links?: SiteSocialLink[]): PiSnsLink | null {
  const p = (links || []).find((l) => l.isPrimary && l.enabled)
  return p ? { platform: p.platform, url: p.url || "" } : null
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
  ) {}

  /** 언어별 SNS 묶음 — ko는 base, 나머지는 i18n(없으면 ko 폴백). 대표(primary) + 전체(channels). */
  private async buildSnsByLang(base?: BlogSiteConfig): Promise<PiSnsByLang> {
    const i18ns = await this.i18nRepo.find({ where: { targetSite: SITE } })
    const byLang: Record<string, SiteSocialLink[] | undefined> = { ko: base?.socialLinks }
    i18ns.forEach((row) => {
      if (row.socialLinks && row.socialLinks.length > 0) byLang[row.lang] = row.socialLinks
    })
    const out: PiSnsByLang = {}
    SNS_LANGS.forEach((lang) => {
      const links = byLang[lang] && byLang[lang]!.length > 0 ? byLang[lang] : base?.socialLinks
      out[lang] = { primary: primarySns(links), channels: activeSns(links) }
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
      name: d.name,
      jobTitle: d.jobTitle,
      specialty: d.specialty,
      photoUrl: d.photoUrl,
    }))
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
    return { enabled, location, doctors, ops, warnings }
  }

  /** 실제 동기화. PI 미설정 시 skip. 변경 없으면 no-op. */
  async syncNow(): Promise<{ enabled: boolean; executed: number; warnings: unknown[] }> {
    if (!this.pi.enabled()) return { enabled: false, executed: 0, warnings: [] }
    const facts = await this.pi.getFacts()
    const location = await this.buildLocation()
    const doctors = await this.buildDoctors()
    const { ops, warnings } = planSync(location, doctors, facts)
    if (ops.length > 0) await this.pi.executePlan(ops, facts)
    return { enabled: true, executed: ops.length, warnings }
  }

  /**
   * 저장 흐름에서 부르는 best-effort 트리거. PI 실패가 어드민 저장을 막지 않도록 에러를 삼키고 로그만 남긴다.
   * (엄격한 롤백이 필요하면 추후 저장 트랜잭션 안에서 syncNow를 호출하도록 설계)
   */
  async syncSafe(context: string): Promise<void> {
    if (!this.pi.enabled()) return
    try {
      const r = await this.syncNow()
      if (r.executed > 0) this.logger.log(`PI 동기화(${context}): ${r.executed}건 반영`)
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.logger.warn(`PI 동기화 실패(${context}): ${(e as any)?.piMessage || (e as any)?.message}`)
    }
  }
}
