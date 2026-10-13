import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 예약 화면 안내(NOTICE) 문구를 기본정보에 추가 — 언어별 작성 + 언어별 노출 토글.
 * site_config(기본/ko)·site_config_i18n(언어별) 양쪽에 컬럼 추가.
 * enabled는 기본(ko)엔 default false, 언어별엔 nullable(비우면 기본 따름).
 * blog 스키마, 추가만.
 */
export class AddSiteConfigReservationNotice1787100000000 implements MigrationInterface {
  name = "AddSiteConfigReservationNotice1787100000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config" ADD COLUMN IF NOT EXISTS "reservation_notice" text`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config" ADD COLUMN IF NOT EXISTS "reservation_notice_enabled" boolean NOT NULL DEFAULT false`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config_i18n" ADD COLUMN IF NOT EXISTS "reservation_notice" text`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config_i18n" ADD COLUMN IF NOT EXISTS "reservation_notice_enabled" boolean`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config_i18n" DROP COLUMN IF EXISTS "reservation_notice_enabled"`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config_i18n" DROP COLUMN IF EXISTS "reservation_notice"`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config" DROP COLUMN IF EXISTS "reservation_notice_enabled"`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config" DROP COLUMN IF EXISTS "reservation_notice"`,
    )
  }
}
