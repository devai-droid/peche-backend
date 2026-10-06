import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * blog.posts.redirect_to_slug — 옛 글을 새 글로 영구 이전(301)하기 위한 대상 slug.
 * 값이 있으면: 그 글 접속 시 같은 언어의 /blog/{redirect_to_slug}로 301, 블로그 목록·사이트맵·RSS에서 제외(글은 삭제 안 함).
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogPostRedirectToSlug1785300000000 implements MigrationInterface {
  name = "AddBlogPostRedirectToSlug1785300000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ADD COLUMN IF NOT EXISTS "redirect_to_slug" varchar(255)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "redirect_to_slug"`)
  }
}
