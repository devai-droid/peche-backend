import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 기본 정보 관리 확장: 진료시간(평일/주말/점심)·주차·대표자명·사업자등록번호·SNS 링크(푸터·헤더용).
 * blog.site_config(공통+ko) 와 blog.site_config_i18n(언어별)에 컬럼 추가.
 * 진료시간·대표자명·SNS는 언어별 오버라이드 대상, 주차·사업자등록번호는 공통(기본 행)만.
 * 기존 웹 하드코딩 값(진료시간·대표자명·사업자등록번호)을 시드해 프론트 전환 시 화면이 동일하게 유지되도록 함.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddSiteConfigContactHours1785300000000 implements MigrationInterface {
  name = "AddSiteConfigContactHours1785300000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 공통(기본 행): 진료시간·주차·대표자명·사업자등록번호·표시용 주소·약도·SNS
    await queryRunner.query(`
      ALTER TABLE "blog"."site_config"
        ADD COLUMN IF NOT EXISTS "weekday_hours" character varying(200),
        ADD COLUMN IF NOT EXISTS "weekend_hours" character varying(200),
        ADD COLUMN IF NOT EXISTS "lunch_info" character varying(300),
        ADD COLUMN IF NOT EXISTS "parking_info" text,
        ADD COLUMN IF NOT EXISTS "representative_name" character varying(100),
        ADD COLUMN IF NOT EXISTS "business_registration_number" character varying(50),
        ADD COLUMN IF NOT EXISTS "display_address" text,
        ADD COLUMN IF NOT EXISTS "landmark" character varying(200),
        ADD COLUMN IF NOT EXISTS "social_links" jsonb
    `)

    // 언어별 오버라이드: 진료시간·대표자명·표시용 주소·약도·SNS (주차·사업자등록번호는 공통이라 제외)
    await queryRunner.query(`
      ALTER TABLE "blog"."site_config_i18n"
        ADD COLUMN IF NOT EXISTS "weekday_hours" character varying(200),
        ADD COLUMN IF NOT EXISTS "weekend_hours" character varying(200),
        ADD COLUMN IF NOT EXISTS "lunch_info" character varying(300),
        ADD COLUMN IF NOT EXISTS "representative_name" character varying(100),
        ADD COLUMN IF NOT EXISTS "display_address" text,
        ADD COLUMN IF NOT EXISTS "landmark" character varying(200),
        ADD COLUMN IF NOT EXISTS "social_links" jsonb
    `)

    // 현재 웹 하드코딩 값 시드(비어있을 때만). 프론트 전환 후에도 화면이 지금과 동일하게 유지되도록.
    await queryRunner.query(`
      UPDATE "blog"."site_config" SET
        "weekday_hours" = COALESCE("weekday_hours", '평일 : AM 10:30 ~ PM 21:00'),
        "weekend_hours" = COALESCE("weekend_hours", '주말·공휴일 : AM 10:00 ~ PM 18:00'),
        "lunch_info" = COALESCE("lunch_info", '※ 점심시간 없이 연중무휴 진료합니다.'),
        "representative_name" = COALESCE("representative_name", '안태언'),
        "business_registration_number" = COALESCE("business_registration_number", '219-05-28999'),
        "display_address" = COALESCE("display_address", E'서울특별시 강남구 강남대로 364,\n3층 전체 (역삼동, 미왕빌딩)'),
        "landmark" = COALESCE("landmark", '강남역 4번 출구 앞')
      WHERE "target_site" = 'peche'
    `)

    // 대표 전화번호는 푸터 표기값(02-553-8176)으로 통일 (사용자 확정).
    await queryRunner.query(`
      UPDATE "blog"."site_config" SET "telephone" = '02-553-8176'
      WHERE "target_site" = 'peche'
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."site_config_i18n"
        DROP COLUMN IF EXISTS "weekday_hours",
        DROP COLUMN IF EXISTS "weekend_hours",
        DROP COLUMN IF EXISTS "lunch_info",
        DROP COLUMN IF EXISTS "representative_name",
        DROP COLUMN IF EXISTS "display_address",
        DROP COLUMN IF EXISTS "landmark",
        DROP COLUMN IF EXISTS "social_links"
    `)
    await queryRunner.query(`
      ALTER TABLE "blog"."site_config"
        DROP COLUMN IF EXISTS "weekday_hours",
        DROP COLUMN IF EXISTS "weekend_hours",
        DROP COLUMN IF EXISTS "lunch_info",
        DROP COLUMN IF EXISTS "parking_info",
        DROP COLUMN IF EXISTS "representative_name",
        DROP COLUMN IF EXISTS "business_registration_number",
        DROP COLUMN IF EXISTS "display_address",
        DROP COLUMN IF EXISTS "landmark",
        DROP COLUMN IF EXISTS "social_links"
    `)
  }
}
