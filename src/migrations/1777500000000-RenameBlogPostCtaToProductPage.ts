import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * blog.posts CTA 컬럼 정리.
 * - cta_detail_page → product_page 로 이름 변경 (CTA 대상 상세페이지명)
 * - cta_category 제거 (CTA 대분류 fallback은 글의 product_category_id를 그대로 사용)
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class RenameBlogPostCtaToProductPage1777500000000 implements MigrationInterface {
  name = "RenameBlogPostCtaToProductPage1777500000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" RENAME COLUMN "cta_detail_page" TO "product_page"
    `)
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "cta_category"
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ADD COLUMN IF NOT EXISTS "cta_category" VARCHAR(200)
    `)
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" RENAME COLUMN "product_page" TO "cta_detail_page"
    `)
  }
}
