import { canonicalCatalog, catalogChanged, catalogCounts, catalogOf, kstDate, tidy, type CatalogSource } from "@root/pi/pi-catalog.util"

// PI 시술·이벤트 카탈로그 변환 순수부 — 대응표는 pi 쪽 참조 구현(workers/lib/catalogOfSite.ts)과 같아야 한다.

const src = (): CatalogSource => ({
  categories: [
    {
      id: "C1",
      name: "보톡스",
      nameEN: "Botox",
      nameZH: "肉毒",
      status: "ACTIVE",
      order: 2,
      detailPages: [
        { id: "D1", name: "사각턱 보톡스", nameEN: "Jaw Botox", status: "ACTIVE", order: 1 },
        { id: "D9", name: "비활성 페이지", status: "INACTIVE", order: 9 },
      ],
    },
    { id: "C0", name: "리프팅", status: "ACTIVE", order: 1, detailPages: [] },
    { id: "C9", name: "숨긴 분류", status: "INACTIVE", order: 0, detailPages: [] },
  ],
  products: [
    {
      id: "P1",
      name: "사각턱 보톡스  50u",
      nameEN: "Jaw Botox 50u",
      price: 150000,
      discountPrice: 99000,
      description: " 1회  기준 \n 부가세 별도 ",
      order: 3,
      visible: true,
      category: { id: "C1", name: "보톡스" },
      detailPage: { id: "D1", name: "사각턱 보톡스" },
    },
    { id: "P2", name: "숨긴 상품", price: 1000, visible: null, category: { id: "C0", name: "리프팅" }, detailPage: null },
    // 분류 목록에 없는(비활성) 분류·상세페이지를 가리키는 상품 → 그 이름으로 묶음을 만든다
    { id: "P3", name: "옛 상품", price: 2000, visible: true, category: { id: "C9", name: "숨긴 분류" }, detailPage: { id: "D8", name: "옛 페이지" } },
  ],
  bundles: [
    {
      id: "B1",
      name: "10월 이벤트",
      startDate: new Date("2026-09-30T15:00:00Z"), // KST 10-01 00:00
      endDate: new Date("2026-10-31T00:00:00Z"),
      postStartDate: new Date("2026-09-25T10:00:00Z"),
      postEndDate: null,
      order: 1,
      events: [
        {
          id: "E1",
          name: "리쥬란 (Rejuran) \n+ 보톡스",
          price: 300000,
          discountPrice: 199000,
          label: ["BEST", "POP"],
          order: 1,
          visible: true,
          category: { name: "이벤트 분류" },
          detailPage: { name: "리쥬란" },
        },
        { id: "E2", name: "둘째", price: 100, visible: false, order: 2, category: { name: "이벤트 분류" } },
      ],
    },
  ],
})

describe("catalogOf — 대응표", () => {
  const c = catalogOf(src())

  it("분류(ACTIVE)·상세페이지(ACTIVE)·상품이 가리키는 비활성 묶음까지 key 접두 규칙대로", () => {
    expect(c.groups.map((g) => [g.key, g.parent_key])).toEqual([
      ["peche-cat-c0", null],
      ["peche-cat-c1", null],
      ["peche-dp-d1", "peche-cat-c1"],
      ["peche-cat-c9", null],
      ["peche-dp-d8", "peche-cat-c9"],
    ])
    const cat = c.groups.find((g) => g.key === "peche-cat-c1")!
    expect(cat.names).toEqual({ en: "Botox", "zh-CN": "肉毒" })
    expect(cat.site_ref).toBe("C1")
    expect(c.groups.find((g) => g.key === "peche-dp-d8")!.sort_order).toBe(9999)
  })

  it("상품 → 시술(값은 facts: price·discount_price·notice, 이름은 공백 정리, 노출은 true일 때만)", () => {
    const p1 = c.services.find((s) => s.key === "peche-p1")!
    expect(p1.name).toBe("사각턱 보톡스 50u")
    expect(p1.names).toEqual({ en: "Jaw Botox 50u" })
    expect(p1.group_key).toBe("peche-dp-d1")
    expect(p1.site_ref).toBe("P1")
    expect(p1.facts).toEqual({ price: "150000", discount_price: "99000", notice: "1회 기준\n부가세 별도" })
    const p2 = c.services.find((s) => s.key === "peche-p2")!
    expect(p2.visible).toBe(false)
    expect(p2.group_key).toBe("peche-cat-c0")
    expect(p2.facts).toEqual({ price: "1000" })
  })

  it("번들 → 이벤트(날짜는 한국 날짜, 라벨·분류 표기·안내)", () => {
    const b = c.bundles[0]
    expect(b.key).toBe("peche-b-b1")
    expect(b.start_date).toBe("2026-10-01")
    expect(b.end_date).toBe("2026-10-31")
    expect(b.post_start_date).toBe("2026-09-25")
    expect(b.post_end_date).toBeNull()
    expect(b.events.map((e) => e.key)).toEqual(["peche-e-e1", "peche-e-e2"])
    expect(b.events[0]).toMatchObject({ name: "리쥬란 (Rejuran) + 보톡스", price: 300000, discount_price: 199000, labels: ["BEST", "POP"], group_name: "리쥬란", visible: true })
    expect(b.events[1]).toMatchObject({ group_name: "이벤트 분류", visible: false, discount_price: null, description: null })
  })

  it("개수", () => {
    expect(catalogCounts(c)).toEqual({ groups: 5, services: 3, bundles: 1, events: 2 })
  })
})

describe("catalogChanged — pi가 돌려준 정규형과 비교", () => {
  it("배열 순서·키 순서가 달라도 같다, 값이 다르면 다르다, 빈 pi는 다르다", () => {
    const local = catalogOf(src())
    const fromPi = JSON.parse(JSON.stringify(canonicalCatalog(local)))
    fromPi.groups.reverse()
    expect(catalogChanged(local, fromPi)).toBe(false)
    const changed = JSON.parse(JSON.stringify(fromPi))
    changed.services[0].facts.price = "150001"
    expect(catalogChanged(local, changed)).toBe(true)
    expect(catalogChanged(local, { groups: [], services: [], bundles: [] })).toBe(true)
    expect(catalogChanged(local, null)).toBe(true)
  })

  it("visible=false는 생략·true와 구분된다", () => {
    const local = catalogOf(src())
    const fromPi = JSON.parse(JSON.stringify(canonicalCatalog(local)))
    const p2 = fromPi.services.find((s: { key: string }) => s.key === "peche-p2")
    p2.visible = true
    expect(catalogChanged(local, fromPi)).toBe(true)
  })
})

describe("보조", () => {
  it("kstDate — 한국 날짜로 자른다, 없으면 null", () => {
    expect(kstDate(new Date("2026-09-30T15:00:00Z"))).toBe("2026-10-01")
    expect(kstDate("2026-10-31T23:30:00+09:00")).toBe("2026-10-31")
    expect(kstDate(null)).toBeNull()
  })
  it("tidy — 연속 공백·줄바꿈을 공백 하나로", () => {
    expect(tidy("  a \n b  ")).toBe("a b")
  })
})
