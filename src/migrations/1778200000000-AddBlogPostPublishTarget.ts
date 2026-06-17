import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * blog.posts 에 publish_target 컬럼 추가.
 * 글 노출 대상 구분: blog(블로그 목록, 기본) / detail_page(시술 상세페이지 영상 아래 섹션).
 * detail_page 글은 블로그 목록에서 제외되고, product_page 이름으로 해당 상세페이지에 노출됨.
 *
 * 기존 글은 전부 기본값 'blog' → 동작 변화 없음. nullable 아님 + default라 안전.
 */
export class AddBlogPostPublishTarget1778200000000 implements MigrationInterface {
  name = "AddBlogPostPublishTarget1778200000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts"
      ADD COLUMN IF NOT EXISTS "publish_target" character varying(20) NOT NULL DEFAULT 'blog'
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_blog_posts_publish_target"
      ON "blog"."posts" ("publish_target")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "blog"."idx_blog_posts_publish_target"`)
    await queryRunner.query(`ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "publish_target"`)
  }
}
