import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 블로그 글 스키마 about(핵심 시술) — blog.posts.medical_about.
 * 마케터가 frontmatter `about`에 적는 핵심 시술 목록. [{ name, procedureType?, bodyLocation? }]
 * 사이트가 BlogPosting.about에 이 값 + product_page 개별 시술(자동 url)을 합쳐 넣음.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogPostMedicalAbout1778600000000 implements MigrationInterface {
  name = "AddBlogPostMedicalAbout1778600000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ADD COLUMN IF NOT EXISTS "medical_about" jsonb
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "medical_about"`)
  }
}
