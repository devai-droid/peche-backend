import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 블로그 글별 감수 의료진(blog.posts.reviewer_doctor_ids) 컬럼.
 * author_doctor(작성)와 분리 — 스키마 reviewedBy(감수)에 별도 반영. 여러 명 가능.
 * 없으면 렌더 시 author_doctor로 폴백(기존 글 호환).
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogPostReviewerDoctors1778500000000 implements MigrationInterface {
  name = "AddBlogPostReviewerDoctors1778500000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ADD COLUMN IF NOT EXISTS "reviewer_doctor_ids" uuid[]
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "reviewer_doctor_ids"`)
  }
}
