import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import axios, { AxiosInstance } from "axios"
import { Env } from "@root/shared/enum/env"
import { PiFacts, PiOp } from "./pi-sync.util"

/**
 * PI(챗봇) facts API 호출부. 토큰·조직/테넌트ID는 서버 환경변수에서만 읽는다.
 * 네 값(base·token·org·tenant)이 모두 있어야 enabled; 하나라도 비면 동기화는 no-op.
 * 엔드포인트는 참고 구현(pi-client.js)과 동일 규격.
 */
@Injectable()
export class PiClientService {
  private readonly logger = new Logger(PiClientService.name)
  private readonly base: string
  private readonly token: string
  private readonly orgId: string
  private readonly tenantId: string
  private readonly http: AxiosInstance

  constructor(private readonly config: ConfigService) {
    this.base = (this.config.get<string>(Env.PI_API_BASE) || "https://pi-agent.dev-philomedi.workers.dev").replace(
      /\/$/,
      "",
    )
    this.token = this.config.get<string>(Env.PI_API_TOKEN) || ""
    this.orgId = this.config.get<string>(Env.PI_ORG_ID) || ""
    this.tenantId = this.config.get<string>(Env.PI_TENANT_ID) || ""
    this.http = axios.create({
      baseURL: this.base,
      timeout: 15000,
      headers: { Accept: "application/json", Authorization: `Bearer ${this.token}` },
    })
  }

  enabled(): boolean {
    return !!(this.token && this.orgId && this.tenantId)
  }

  // 2xx가 아니면 PI 메시지(한글 우선)로 에러를 던진다.
  private async req<T = unknown>(method: string, apiPath: string, body?: unknown): Promise<T> {
    try {
      const res = await this.http.request<T>({ method, url: apiPath, data: body })
      return res.data
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any
      const j = err?.response?.data
      const msg = (j && (j.message || j.error || j.detail)) || `PI 오류(HTTP ${err?.response?.status ?? "?"})`
      const out = new Error(msg) as Error & { status?: number; piMessage?: string; body?: unknown }
      out.status = err?.response?.status
      out.piMessage = msg
      out.body = j
      throw out
    }
  }

  getFacts(): Promise<PiFacts> {
    return this.req<PiFacts>("GET", `/api/tenants/${this.tenantId}/facts`)
  }
  createLocation(b: Record<string, unknown>) {
    return this.req("POST", `/api/orgs/${this.orgId}/locations`, b)
  }
  updateLocation(id: string, b: Record<string, unknown>) {
    return this.req("PATCH", `/api/orgs/${this.orgId}/locations/${id}`, b)
  }
  createPractitioner(b: Record<string, unknown>) {
    return this.req("POST", `/api/orgs/${this.orgId}/practitioners`, b)
  }
  updatePractitioner(id: string, b: Record<string, unknown>) {
    return this.req("PATCH", `/api/orgs/${this.orgId}/practitioners/${id}`, b)
  }
  deletePractitioner(id: string) {
    return this.req("DELETE", `/api/orgs/${this.orgId}/practitioners/${id}`)
  }
  setRole(practitionerId: string, locationId: string, position: string) {
    return this.req("PUT", `/api/orgs/${this.orgId}/roles`, { practitionerId, locationId, position })
  }

  /** 신규 의료진 key(이름 기반 슬러그) */
  private pracKey(name: string): string {
    return "doc-" + Buffer.from(String(name || "")).toString("hex").slice(0, 12)
  }

  /** 계획 실행: 지점 → 의료진 → (신규 있으면 facts 재조회) → 역할 배치. 실패 시 즉시 throw. */
  async executePlan(ops: PiOp[], facts: PiFacts): Promise<{ ok: true }> {
    const key2locId: Record<string, string> = {}
    ;(facts.locations || []).forEach((l) => (key2locId[l.key] = l.id))
    const name2pracId: Record<string, string> = {}
    ;(facts.practitioners || []).forEach((p) => (name2pracId[p.name] = p.id))
    let hasCreate = false

    for (const o of ops) {
      if (o.kind !== "location") continue
      if (o.action === "create") {
        await this.createLocation(o.payload)
        hasCreate = true
      } else if (o.action === "update" && o.id) {
        await this.updateLocation(o.id, o.payload)
      }
    }
    for (const p of ops) {
      if (p.kind !== "practitioner") continue
      if (p.action === "create") {
        await this.createPractitioner({ key: this.pracKey(p.name), ...p.payload })
        hasCreate = true
      } else if (p.action === "update" && p.id) {
        await this.updatePractitioner(p.id, p.payload)
      } else if (p.action === "delete" && p.id) {
        // 사이트에 없는 의료진은 PI에서 완전 삭제(사이트 데이터 최우선)
        await this.deletePractitioner(p.id)
      }
    }
    const needRole =
      ops.some((x) => x.kind === "role") || ops.some((x) => x.kind === "practitioner" && x.action === "create")
    if (needRole && hasCreate) {
      const fresh = await this.getFacts()
      ;(fresh.locations || []).forEach((l) => (key2locId[l.key] = l.id))
      ;(fresh.practitioners || []).forEach((pp) => (name2pracId[pp.name] = pp.id))
    }
    for (const q of ops) {
      if (q.kind === "practitioner" && q.action === "create") {
        const pid = name2pracId[q.name]
        const lid = q.at ? key2locId[q.at] : undefined
        if (pid && lid && q.position) await this.setRole(pid, lid, q.position)
      } else if (q.kind === "role" && q.action === "set") {
        const pid = q.id || name2pracId[q.name]
        const lid = key2locId[q.at]
        if (pid && lid) await this.setRole(pid, lid, q.position)
      }
    }
    return { ok: true }
  }
}
