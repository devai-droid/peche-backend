import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 대표 상담 채널(primary_consult, 언어별) + 공통 SNS(common_social_links, 전 언어 공통) 컬럼 추가.
 * 대표 상담 채널 = '상담하기' 버튼·모바일 탭바 상담 버튼의 목적지. 현재 하드코딩 값으로 언어별 시드.
 * 공통 SNS는 비워 둠(어드민에서 입력). blog schema만 변경, 운영 public.* 무손.
 */
export class AddPrimaryConsultAndCommonSocial1785600000000 implements MigrationInterface {
  name = "AddPrimaryConsultAndCommonSocial1785600000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."site_config"
        ADD COLUMN IF NOT EXISTS "common_social_links" jsonb,
        ADD COLUMN IF NOT EXISTS "primary_consult_platform" character varying(40),
        ADD COLUMN IF NOT EXISTS "primary_consult_url" text
    `)
    await queryRunner.query(`
      ALTER TABLE "blog"."site_config_i18n"
        ADD COLUMN IF NOT EXISTS "primary_consult_platform" character varying(40),
        ADD COLUMN IF NOT EXISTS "primary_consult_url" text
    `)

    // ko (기본 행) 대표 상담 = 카카오
    await queryRunner.query(`
      UPDATE "blog"."site_config" SET
        "primary_consult_platform" = COALESCE("primary_consult_platform", 'kakao'),
        "primary_consult_url" = COALESCE("primary_consult_url", 'http://pf.kakao.com/_dxoiLn')
      WHERE "target_site" = 'peche'
    `)

    // 언어별 대표 상담 채널 시드 (비어 있을 때만)
    const seed: Record<string, [string, string]> = {
      en: ["whatsapp", "https://wa.me/message/4Y5JC2HX6OH5H1"],
      ja: ["line", "https://line.me/R/ti/p/@235wfyao"],
      th: ["line", "https://line.me/R/ti/p/@892druai"],
      "zh-TW": ["line", "https://line.me/R/ti/p/@683jgqmd"],
      zh: ["wechat", ""],
    }
    for (const [lang, [platform, url]] of Object.entries(seed)) {
      await queryRunner.query(
        `INSERT INTO "blog"."site_config_i18n" ("target_site","lang","primary_consult_platform","primary_consult_url")
         VALUES ('peche', $1, $2, $3)
         ON CONFLICT ("target_site","lang")
         DO UPDATE SET
           "primary_consult_platform" = COALESCE("site_config_i18n"."primary_consult_platform", EXCLUDED."primary_consult_platform"),
           "primary_consult_url" = COALESCE("site_config_i18n"."primary_consult_url", EXCLUDED."primary_consult_url")`,
        [lang, platform, url],
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."site_config_i18n"
        DROP COLUMN IF EXISTS "primary_consult_platform",
        DROP COLUMN IF EXISTS "primary_consult_url"
    `)
    await queryRunner.query(`
      ALTER TABLE "blog"."site_config"
        DROP COLUMN IF EXISTS "common_social_links",
        DROP COLUMN IF EXISTS "primary_consult_platform",
        DROP COLUMN IF EXISTS "primary_consult_url"
    `)
  }
}
