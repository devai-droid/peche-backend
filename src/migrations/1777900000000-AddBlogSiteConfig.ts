import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 사이트(병원) 공통 정보 blog.site_config (사이트당 1행). 어드민에서 수정 → 전 글 병원 구조화데이터 반영.
 * 기존 하드코딩(peche.config.ts / blog-site.config.ts) 값을 시드.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogSiteConfig1777900000000 implements MigrationInterface {
  name = "AddBlogSiteConfig1777900000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "blog"."site_config" (
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by" uuid,
        "updated_by" uuid,
        "target_site" character varying(50) NOT NULL,
        "hospital_name" character varying(200) NOT NULL DEFAULT '',
        "base_url" character varying(300) NOT NULL DEFAULT '',
        "organization_type" character varying(50) NOT NULL DEFAULT 'MedicalClinic',
        "telephone" character varying(50),
        "address_street" character varying(200),
        "address_locality" character varying(100),
        "address_region" character varying(100),
        "address_postal_code" character varying(20),
        "address_country" character varying(10),
        "latitude" double precision,
        "longitude" double precision,
        "medical_specialty" character varying(100),
        "same_as" text[],
        "knows_about" text[],
        "certifications" text[],
        CONSTRAINT "pk_blog_site_config" PRIMARY KEY ("target_site")
      )
    `)

    await queryRunner.query(
      `INSERT INTO "blog"."site_config"
        ("target_site","hospital_name","base_url","organization_type","telephone",
         "address_locality","address_region","address_country","medical_specialty","same_as","knows_about")
       VALUES ('peche','페슈의원','https://pecheskin.clinic','MedicalClinic','1661-2365',
         '강남구','서울특별시','KR','Dermatology',
         ARRAY['https://blog.naver.com/pecheclinic'],
         ARRAY['보톡스','필러','스킨부스터','리프팅','울쎄라','레이저'])
       ON CONFLICT ("target_site") DO NOTHING`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "blog"."site_config"`)
  }
}
