import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { BlogSchemaAttribute, BlogSchemaTarget } from "@root/blog-v2/entities/schema-attribute.entity"
import { PECHE_SITE } from "@root/blog-v2/sites/peche.config"

type ParsedRow = { targetType: BlogSchemaTarget; name: string; attributes: Record<string, unknown> }
export type SyncResult = {
  added: number
  updated: number
  deleted: number
  total: number
  unmatched: Array<{ targetType: string; name: string }>
  deletedList: Array<{ targetType: string; name: string }>
}

@Injectable()
export class BlogSchemaAttributeService {
  private readonly logger = new Logger(BlogSchemaAttributeService.name)

  constructor(
    @InjectRepository(BlogSchemaAttribute)
    private readonly repo: Repository<BlogSchemaAttribute>,
  ) {}

  findAll(): Promise<BlogSchemaAttribute[]> {
    return this.repo.find({ order: { targetType: "ASC", name: "ASC" } })
  }

  // ── md 파싱 ─────────────────────────────────────────────
  private clean(s?: string): string {
    return (s ?? "").replace(/\*\*/g, "").replace(/\*/g, "").trim()
  }
  /** 값 정리: 내부 메모 괄호(원장 확인·미기재·자료 없음) 제거. 비면 빈문자. */
  private val(s?: string): string {
    let v = this.clean(s)
    v = v.replace(/\([^)]*(?:원장 확인|미기재|자료 없음)[^)]*\)/g, "").trim()
    v = v.replace(/\s*\/\s*마취:\s*$/, "").trim()
    v = v.replace(/[·,\s]+$/, "").trim()
    if (/^[—\-–]+$/.test(v)) return ""
    return v
  }
  private isSep(row: string): boolean {
    return /^[\s|:\-]+$/.test(row)
  }
  private cells(row: string): string[] {
    return row.replace(/^\||\|$/g, "").split("|")
  }
  /** "key: value<br>key2: value2" → { key, key2 } */
  private parseExtra(s?: string): Record<string, string> {
    const out: Record<string, string> = {}
    const raw = this.clean(s).replace(/<br\s*\/?>/gi, "\n")
    for (const part of raw.split("\n")) {
      const m = part.match(/^\s*([A-Za-z][A-Za-z0-9]*)\s*:\s*(.+)$/)
      if (m) {
        const v = this.val(m[2])
        if (v) out[m[1]] = v
      }
    }
    return out
  }

  /** 스키마 속성 양식(md) → 파싱된 행 목록 (진료과/질환/시술 표만 읽음, 참조 텍스트는 무시) */
  parseMarkdown(md: string): ParsedRow[] {
    const lines = (md ?? "").split("\n")
    const recs = new Map<string, ParsedRow>()
    const put = (target: BlogSchemaTarget, name: string, attrs: Record<string, unknown>) => {
      const nm = this.clean(name)
      if (!nm || /에어녹스/.test(nm) || nm === "—") return
      if (/^(시술명|대분류명|질환명|이름)$/.test(nm)) return // 하위 표 헤더 행 제외
      const a: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "__extra__") {
          Object.assign(a, this.parseExtra(v as string))
          continue
        }
        if (k === "availableService") {
          const list = this.clean(v as string)
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
          if (list.length) a[k] = list
          continue
        }
        const vv = this.val(v as string)
        if (vv) a[k] = vv
      }
      recs.set(`${target}|${nm}`, { targetType: target, name: nm, attributes: a })
    }

    const MAP_DISEASE = [
      "name",
      "signOrSymptom",
      "associatedAnatomy",
      "possibleTreatment",
      "typicalTest",
      "relevantSpecialty",
      "__extra__",
    ]
    const MAP_PROC = ["name", "@type", "procedureType", "bodyLocation", "howPerformed", "preparation", "followup"]
    const MAP_CLINIC = ["name", "medicalSpecialty", "availableService", "description", "__extra__"]

    let mode: "clinic" | "disease" | "category" | "detail_page" | null = null
    let seenHeader = false
    for (const ln of lines) {
      if (/ⓐ\s*진료과|진료과 양식/.test(ln)) {
        mode = "clinic"
        seenHeader = false
        continue
      }
      if (/ⓑ\s*질환|질환 양식/.test(ln)) {
        mode = "disease"
        seenHeader = false
        continue
      }
      if (/시술형 대분류/.test(ln)) {
        mode = "category"
        seenHeader = false
        continue
      }
      if (/상세페이지 시술/.test(ln)) {
        mode = "detail_page"
        seenHeader = false
        continue
      }
      if (!ln.trim().startsWith("|") || !mode) continue
      if (this.isSep(ln)) {
        seenHeader = true // 구분선 이후부터 데이터
        continue
      }
      if (!seenHeader) continue // 헤더 행
      const c = this.cells(ln)
      if (mode === "clinic") {
        const row: Record<string, string> = {}
        MAP_CLINIC.forEach((k, i) => (row[k] = c[i] ?? ""))
        put(BlogSchemaTarget.CLINIC, row.name, {
          medicalSpecialty: row.medicalSpecialty,
          availableService: row.availableService,
          description: row.description,
          __extra__: row.__extra__,
        })
      } else if (mode === "disease") {
        const row: Record<string, string> = {}
        MAP_DISEASE.forEach((k, i) => (row[k] = c[i] ?? ""))
        put(BlogSchemaTarget.CATEGORY, row.name, {
          "@type": "MedicalCondition",
          signOrSymptom: row.signOrSymptom,
          associatedAnatomy: row.associatedAnatomy,
          possibleTreatment: row.possibleTreatment,
          typicalTest: row.typicalTest,
          relevantSpecialty: row.relevantSpecialty,
          __extra__: row.__extra__,
        })
      } else {
        const row: Record<string, string> = {}
        MAP_PROC.forEach((k, i) => (row[k] = c[i] ?? ""))
        put(mode === "category" ? BlogSchemaTarget.CATEGORY : BlogSchemaTarget.DETAIL_PAGE, row.name, {
          "@type": row["@type"],
          procedureType: row.procedureType,
          bodyLocation: row.bodyLocation,
          howPerformed: row.howPerformed,
          preparation: row.preparation,
          followup: row.followup,
        })
      }
    }
    return [...recs.values()]
  }

  /** 사이트에 실재하는 이름 집합(대분류·상세페이지·병원명)으로 매칭 검증 */
  private async siteNames(): Promise<{ category: Set<string>; detailPage: Set<string>; hospital: string }> {
    const norm = (s: string) => (s ?? "").replace(/\s+/g, "").toLowerCase()
    const cat: Array<{ name: string }> = await this.repo.query(
      `SELECT name FROM public.product_category WHERE status = 'ACTIVE'`,
    )
    const dp: Array<{ name: string }> = await this.repo.query(
      `SELECT name FROM public.product_detail_page WHERE status = 'ACTIVE'`,
    )
    return {
      category: new Set(cat.map((r) => norm(r.name))),
      detailPage: new Set(dp.map((r) => norm(r.name))),
      hospital: norm(PECHE_SITE.hospitalName),
    }
  }

  /**
   * 스키마 속성 양식(md) 전체 동기화 — md가 원본(single source of truth).
   * md에 있으면 upsert, 없으면 삭제. 사이트에 실재하지 않는 이름은 unmatched로 보고(등록은 되지만 어떤 글에도 안 붙음).
   */
  async syncFromMarkdown(md: string, user?: string): Promise<SyncResult> {
    const rows = this.parseMarkdown(md)
    const site = await this.siteNames()
    const norm = (s: string) => (s ?? "").replace(/\s+/g, "").toLowerCase()

    const unmatched: Array<{ targetType: string; name: string }> = []
    for (const r of rows) {
      const ok =
        r.targetType === BlogSchemaTarget.CATEGORY
          ? site.category.has(norm(r.name))
          : r.targetType === BlogSchemaTarget.DETAIL_PAGE
            ? site.detailPage.has(norm(r.name))
            : norm(r.name) === site.hospital
      if (!ok) unmatched.push({ targetType: r.targetType, name: r.name })
    }

    const parsedKeys = new Set(rows.map((r) => `${r.targetType}|${r.name}`))
    const existing = await this.repo.find()
    const existingKeys = new Set(existing.map((e) => `${e.targetType}|${e.name}`))

    const deletedList = existing
      .filter((e) => !parsedKeys.has(`${e.targetType}|${e.name}`))
      .map((e) => ({ targetType: e.targetType, name: e.name }))
    let added = 0
    for (const r of rows) if (!existingKeys.has(`${r.targetType}|${r.name}`)) added++

    await this.repo.manager.transaction(async (tx) => {
      // 1) md에 없는 기존 항목 삭제
      for (const d of deletedList) {
        await tx.delete(BlogSchemaAttribute, { targetType: d.targetType as BlogSchemaTarget, name: d.name })
      }
      // 2) md 항목 upsert
      for (const r of rows) {
        await tx
          .createQueryBuilder()
          .insert()
          .into(BlogSchemaAttribute)
          .values({ targetType: r.targetType, name: r.name, attributes: r.attributes, createdBy: user, updatedBy: user })
          .orUpdate(["attributes", "updated_by"], ["target_type", "name"])
          .execute()
      }
    })

    return {
      added,
      updated: rows.length - added,
      deleted: deletedList.length,
      total: rows.length,
      unmatched,
      deletedList,
    }
  }
}
