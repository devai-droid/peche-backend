import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 블로그 글별 CTA 버튼 링크(blog.posts.cta_links) 컬럼.
 * product_page(노출 위치)와 분리된 버튼 연결 정보. 최대 2개.
 * 형태: [{ "type": "page"|"category"|"event", "target": "이름", "text": "버튼문구", "url": "/products/{id}" }]
 * 파싱 시점에 이름→URL 해석해 저장(상세페이지/상시대분류/이벤트대분류).
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogPostCtaLinks1778300000000 implements MigrationInterface {
  name = "AddBlogPostCtaLinks1778300000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ADD COLUMN IF NOT EXISTS "cta_links" jsonb
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "cta_links"`)
  }
}
