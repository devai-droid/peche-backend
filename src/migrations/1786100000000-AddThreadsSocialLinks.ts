import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 한국·일본·대만 언어별 SNS에 쓰레드(threads) 항목을 추가한다(이미 있으면 건너뜀).
 * ko는 site_config(기본), ja·zh-TW는 site_config_i18n. 기존 항목은 보존(배열에 append).
 * threads는 알려진 플랫폼이라 프론트가 기본 아이콘을 자동 사용한다.
 */
export class AddThreadsSocialLinks1786100000000 implements MigrationInterface {
  name = "AddThreadsSocialLinks1786100000000"

  private readonly threads: Record<string, { url: string; order: number }> = {
    ko: { url: "https://www.threads.com/@peche_clinic", order: 3 },
    ja: { url: "https://www.threads.com/@pecheclinic.jp", order: 2 },
    "zh-TW": { url: "https://www.threads.com/@pecheclinic_tw", order: 2 },
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ko = 기본 행
    await queryRunner.query(
      `UPDATE "blog"."site_config"
         SET "social_links" = COALESCE("social_links", '[]'::jsonb) || $1::jsonb
       WHERE "target_site" = 'peche'
         AND NOT (COALESCE("social_links", '[]'::jsonb) @> '[{"platform":"threads"}]'::jsonb)`,
      [JSON.stringify([{ platform: "threads", url: this.threads.ko.url, enabled: true, order: this.threads.ko.order }])],
    )
    // ja, zh-TW = i18n 행
    for (const lang of ["ja", "zh-TW"]) {
      const t = this.threads[lang]
      await queryRunner.query(
        `UPDATE "blog"."site_config_i18n"
           SET "social_links" = COALESCE("social_links", '[]'::jsonb) || $2::jsonb
         WHERE "target_site" = 'peche' AND "lang" = $1
           AND NOT (COALESCE("social_links", '[]'::jsonb) @> '[{"platform":"threads"}]'::jsonb)`,
        [lang, JSON.stringify([{ platform: "threads", url: t.url, enabled: true, order: t.order }])],
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 추가한 threads 항목만 제거
    await queryRunner.query(
      `UPDATE "blog"."site_config"
         SET "social_links" = (
           SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
           FROM jsonb_array_elements(COALESCE("social_links", '[]'::jsonb)) elem
           WHERE elem->>'platform' <> 'threads'
         )
       WHERE "target_site" = 'peche'`,
    )
    await queryRunner.query(
      `UPDATE "blog"."site_config_i18n"
         SET "social_links" = (
           SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
           FROM jsonb_array_elements(COALESCE("social_links", '[]'::jsonb)) elem
           WHERE elem->>'platform' <> 'threads'
         )
       WHERE "target_site" = 'peche' AND "lang" IN ('ja', 'zh-TW')`,
    )
  }
}
