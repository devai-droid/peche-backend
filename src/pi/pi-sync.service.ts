import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogSiteConfig } from "@root/blog-v2/entities/site-config.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { PiClientService } from "./pi-client.service"
import {
  PECHE_LOCATION_KEY,
  PiLocationPayload,
  SyncDoctor,
  cleanText,
  pecheHoursToPI,
  planSync,
} from "./pi-sync.util"

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
    @InjectRepository(BlogDoctor) private readonly doctorRepo: Repository<BlogDoctor>,
  ) {}

  /** 사이트 기본정보(공통 ko 행) → PI location 1건 */
  private async buildLocation(): Promise<PiLocationPayload> {
    const cfg = await this.configRepo.findOne({ where: { targetSite: SITE } })
    const kakaoLink = (cfg?.socialLinks || []).find((l) => l.platform === "kakao" && l.enabled)?.url
    const kakaoUrl =
      kakaoLink || (cfg?.primaryConsultPlatform === "kakao" ? cfg?.primaryConsultUrl || "" : "")
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

  /** 미리보기(실행 없이 계획만) */
  async preview() {
    if (!this.pi.enabled()) return { enabled: false, ops: [], warnings: [] }
    const facts = await this.pi.getFacts()
    const location = await this.buildLocation()
    const doctors = await this.buildDoctors()
    const { ops, warnings } = planSync(location, doctors, facts)
    return { enabled: true, location, doctors, ops, warnings }
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
