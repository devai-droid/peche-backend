import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 블로그·상세페이지 글의 언어판 연결 키(blog.posts.hreflang_key) 컬럼.
 * 같은 값을 가진 글들을 서로의 언어판으로 보고 hreflang(대체 언어 링크)로 연결한다.
 * 마케터가 md 프론트매터에 `hreflang_key`로 같은 값을 넣으면 자동 연결. 한 언어만 있으면 hreflang은 생성되지 않는다.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogPostHreflangKey1785000000000 implements MigrationInterface {
  name = "AddBlogPostHreflangKey1785000000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ADD COLUMN IF NOT EXISTS "hreflang_key" varchar(255)
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_blog_posts_hreflang_key" ON "blog"."posts" ("hreflang_key")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "blog"."idx_blog_posts_hreflang_key"`)
    await queryRunner.query(`ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "hreflang_key"`)
  }
}
