import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * blog.posts에 CTA 대상 컬럼 추가 (이름 기반 매칭).
 * - cta_detail_page: CTA 버튼이 가리킬 상세페이지명 (예: "울쎄라피 프라임")
 * - cta_category: 여러 시술 혼합 시 대분류명 (예: "리프팅")
 * 프론트가 이 이름으로 product_detail_page / product_category를 찾아 링크 생성.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogPostCtaFields1777400000000 implements MigrationInterface {
  name = "AddBlogPostCtaFields1777400000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts"
        ADD COLUMN IF NOT EXISTS "cta_detail_page" VARCHAR(200),
        ADD COLUMN IF NOT EXISTS "cta_category" VARCHAR(200)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts"
        DROP COLUMN IF EXISTS "cta_detail_page",
        DROP COLUMN IF EXISTS "cta_category"
    `)
  }
}
