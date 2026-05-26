import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 블로그 공통 정보 언어별화:
 * - common_texts: lang 컬럼 추가 (target_site+lang+type 유니크). 기존 행 = ko.
 * - doctors: lang 컬럼 추가. 기존 = ko.
 * - site_config_i18n: 언어별 표시값(병원명·주소·진료영역·SNS·인증) 오버라이드 테이블.
 *   (공통 식별값 url/type/telephone/geo 는 site_config 1행 그대로, ko/기본은 site_config 사용)
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogI18n1778000000000 implements MigrationInterface {
  name = "AddBlogI18n1778000000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) common_texts + lang
    await queryRunner.query(
      `ALTER TABLE "blog"."common_texts" ADD COLUMN IF NOT EXISTS "lang" varchar(10) NOT NULL DEFAULT 'ko'`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog"."common_texts" DROP CONSTRAINT IF EXISTS "uq_blog_common_texts_site_type"`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog"."common_texts" ADD CONSTRAINT "uq_blog_common_texts_site_lang_type" UNIQUE ("target_site","lang","type")`,
    )

    // 2) doctors + lang
    await queryRunner.query(
      `ALTER TABLE "blog"."doctors" ADD COLUMN IF NOT EXISTS "lang" varchar(10) NOT NULL DEFAULT 'ko'`,
    )

    // 3) site_config_i18n (언어별 표시값 오버라이드)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "blog"."site_config_i18n" (
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by" uuid,
        "updated_by" uuid,
        "target_site" character varying(50) NOT NULL,
        "lang" character varying(10) NOT NULL,
        "hospital_name" character varying(200),
        "address_street" character varying(200),
        "address_locality" character varying(100),
        "address_region" character varying(100),
        "address_postal_code" character varying(20),
        "address_country" character varying(10),
        "medical_specialty" character varying(100),
        "same_as" text[],
        "knows_about" text[],
        "certifications" text[],
        CONSTRAINT "pk_blog_site_config_i18n" PRIMARY KEY ("target_site","lang")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "blog"."site_config_i18n"`)
    await queryRunner.query(`ALTER TABLE "blog"."doctors" DROP COLUMN IF EXISTS "lang"`)
    await queryRunner.query(
      `ALTER TABLE "blog"."common_texts" DROP CONSTRAINT IF EXISTS "uq_blog_common_texts_site_lang_type"`,
    )
    await queryRunner.query(`ALTER TABLE "blog"."common_texts" DROP COLUMN IF EXISTS "lang"`)
  }
}
