import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 공통 고지문구(blog.common_texts) 테이블 + 글별 적용 고지(blog.posts.notices) 컬럼.
 * 4종(일반/AI/환자사례/후기) 기본 문구 시드. 일반은 모든 글, 나머지는 글별 선택.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogCommonTextsAndPostNotices1777800000000 implements MigrationInterface {
  name = "AddBlogCommonTextsAndPostNotices1777800000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "blog"."common_texts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by" uuid,
        "updated_by" uuid,
        "target_site" character varying(50) NOT NULL DEFAULT 'peche',
        "type" character varying(50) NOT NULL,
        "body" text,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "pk_blog_common_texts" PRIMARY KEY ("id"),
        CONSTRAINT "uq_blog_common_texts_site_type" UNIQUE ("target_site", "type")
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ADD COLUMN IF NOT EXISTS "notices" text[]
    `)

    // 기본 문구 시드 (이미 있으면 유지)
    const seed: Array<[string, string, boolean]> = [
      [
        "general_disclaimer",
        "본 내용은 의학적 정보 제공을 목적으로 작성되었으며, 개인의 상태에 따라 효과·부작용이 다를 수 있습니다. 정확한 진단과 시술 여부는 의료진과 상담 후 결정하시기 바랍니다.",
        true,
      ],
      [
        "ai_image_notice",
        "본문의 이해를 돕기 위해 일부 이미지는 AI로 생성되었으며, 실제 시술 결과와 다를 수 있습니다.",
        true,
      ],
      [
        "patient_case_notice",
        "게재된 사진은 동의를 얻어 사용했으며, 시술 효과는 개인에 따라 차이가 있을 수 있습니다.",
        true,
      ],
      [
        "review_notice",
        "본 후기는 작성자 개인의 경험으로 동일한 효과를 보장하지 않으며, 개인차가 있을 수 있습니다.",
        true,
      ],
    ]
    for (const [type, body, isActive] of seed) {
      await queryRunner.query(
        `INSERT INTO "blog"."common_texts" ("target_site", "type", "body", "is_active")
         VALUES ('peche', $1, $2, $3)
         ON CONFLICT ON CONSTRAINT "uq_blog_common_texts_site_type" DO NOTHING`,
        [type, body, isActive],
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "notices"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "blog"."common_texts"`)
  }
}
