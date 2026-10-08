import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 웹사이트 '페슈의원 의료진 소개' 섹션(기존 하드코딩 6명)을 어드민 데이터(blog.doctors)로 옮긴다.
 * 6명 × 6언어를 시드(이미 있는 (target_site,lang,name)은 건너뜀 — 기존 ko 안태언 보존).
 * - 표시 순서: 안태언·최재형(대표/총괄) → 신동민·박해권·조진형·홍채민. created_at 오프셋으로 순서 고정.
 * - 사진: 안태언은 기존 blog/doctors/antaeeon.webp 유지, 나머지는 site-config/doctors/*.jpg(업로드본).
 * - 모두 isVisible=true, linkedToBlogCard=false(블로그 카드는 기존 ko 안태언만 연결 유지).
 * blog 스키마, 추가만(비파괴).
 */
export class SeedWebsiteDoctors1786500000000 implements MigrationInterface {
  name = "SeedWebsiteDoctors1786500000000"

  private readonly photo: Record<string, string> = {
    ahn: "https://d1snu9ea4bf6mq.cloudfront.net/blog/doctors/antaeeon.webp",
    choi: "https://d1snu9ea4bf6mq.cloudfront.net/site-config/doctors/choi.jpg",
    shin: "https://d1snu9ea4bf6mq.cloudfront.net/site-config/doctors/shin.jpg",
    park: "https://d1snu9ea4bf6mq.cloudfront.net/site-config/doctors/park.jpg",
    cho: "https://d1snu9ea4bf6mq.cloudfront.net/site-config/doctors/cho.jpg",
    hong: "https://d1snu9ea4bf6mq.cloudfront.net/site-config/doctors/hong.jpg",
  }

  // 표시 순서(= created_at 오프셋 분). 안태언이 가장 먼저.
  private readonly order = ["ahn", "choi", "shin", "park", "cho", "hong"]

  // 언어별 이름/직함 (웹사이트 하드코딩 문자열에서 분리)
  private readonly data: Record<string, Record<string, { name: string; jobTitle: string }>> = {
    ko: {
      ahn: { name: "안태언", jobTitle: "대표원장" },
      choi: { name: "최재형", jobTitle: "총괄원장" },
      shin: { name: "신동민", jobTitle: "원장" },
      park: { name: "박해권", jobTitle: "원장" },
      cho: { name: "조진형", jobTitle: "원장" },
      hong: { name: "홍채민", jobTitle: "원장" },
    },
    en: {
      ahn: { name: "Dr. Ahn, Tae-eon", jobTitle: "Chief Director" },
      choi: { name: "Dr. Choi, Jae-hyeong", jobTitle: "General Director" },
      shin: { name: "Dr. Shin, Dong-min", jobTitle: "Director" },
      park: { name: "Dr. Park, Hae-kwon", jobTitle: "Director" },
      cho: { name: "Dr. Cho, Jin-Hyeong", jobTitle: "Director" },
      hong: { name: "Dr. Hong, Chae-min", jobTitle: "Director" },
    },
    zh: {
      ahn: { name: "安泰彦", jobTitle: "代表院长" },
      choi: { name: "崔在亨", jobTitle: "总括院长" },
      shin: { name: "申東慜", jobTitle: "院长" },
      park: { name: "朴海權", jobTitle: "院长" },
      cho: { name: "趙振亨", jobTitle: "院长" },
      hong: { name: "洪彩旻", jobTitle: "院长" },
    },
    ja: {
      ahn: { name: "安泰彦", jobTitle: "代表院長" },
      choi: { name: "崔在亨", jobTitle: "総括院長" },
      shin: { name: "申東慜", jobTitle: "院長" },
      park: { name: "朴海權", jobTitle: "院長" },
      cho: { name: "趙振亨", jobTitle: "院長" },
      hong: { name: "洪彩旻", jobTitle: "院長" },
    },
    th: {
      ahn: { name: "Dr. Ahn, Tae-eon", jobTitle: "Chief Director" },
      choi: { name: "Dr. Choi, Jae-hyeong", jobTitle: "General Director" },
      shin: { name: "Dr. Shin, Dong-min", jobTitle: "Director" },
      park: { name: "Dr. Park, Hae-kwon", jobTitle: "Director" },
      cho: { name: "Dr. Cho, Jin-Hyeong", jobTitle: "Director" },
      hong: { name: "Dr. Hong, Chae-min", jobTitle: "Director" },
    },
    "zh-TW": {
      ahn: { name: "安泰彦", jobTitle: "代表院長" },
      choi: { name: "崔在亨", jobTitle: "總括院長" },
      shin: { name: "申東慜", jobTitle: "院長" },
      park: { name: "朴海權", jobTitle: "院長" },
      cho: { name: "趙振亨", jobTitle: "院長" },
      hong: { name: "洪彩旻", jobTitle: "院長" },
    },
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const base = Date.parse("2026-05-22T14:50:49.000Z") // 기존 ko 안태언과 같은 기준 시각
    for (const lang of Object.keys(this.data)) {
      for (let i = 0; i < this.order.length; i++) {
        const key = this.order[i]
        const { name, jobTitle } = this.data[lang][key]
        const createdAt = new Date(base + i * 60000).toISOString() // 분 단위 오프셋으로 순서 고정
        await queryRunner.query(
          `INSERT INTO "blog"."doctors"
             ("id","lang","name","job_title","photo_url","is_visible","linked_to_blog_card","target_site","created_at","updated_at")
           SELECT gen_random_uuid(), $1, $2, $3, $4, true, false, 'peche', $5::timestamptz, now()
           WHERE NOT EXISTS (
             SELECT 1 FROM "blog"."doctors"
             WHERE "target_site" = 'peche' AND "lang" = $1 AND "name" = $2
           )`,
          [lang, name, jobTitle, this.photo[key], createdAt],
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 시드한 웹사이트 의료진 중 연결 안 된(linked_to_blog_card=false) 것만 제거(기존 ko 안태언 보존)
    const names: string[] = []
    for (const lang of Object.keys(this.data)) {
      for (const key of this.order) names.push(this.data[lang][key].name)
    }
    await queryRunner.query(
      `DELETE FROM "blog"."doctors"
       WHERE "target_site" = 'peche' AND "linked_to_blog_card" = false AND "name" = ANY($1)`,
      [names],
    )
  }
}
