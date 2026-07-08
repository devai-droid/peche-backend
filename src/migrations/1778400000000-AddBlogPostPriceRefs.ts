import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 블로그 글별 가격 섹션 연결(blog.posts.price_refs) 컬럼.
 * product_page(탭 노출 위치)와 분리된 "가격 보기" 소스. CTA처럼 상세페이지/대분류를 각각 지정, 있는 것만 노출.
 * 형태: [{ "type": "page"|"category", "id": "uuid", "name": "이름" }]
 *  - page: 상세페이지 → 그 상세페이지 상품/이벤트, 더보기는 /products/{id}
 *  - category: 대분류 → 그 대분류 소속 상세페이지 전체 상품/이벤트, 더보기는 /products?category={id}
 * 파싱 시점에 이름→id 해석해 저장. 없으면 product_page(상세페이지명)로 폴백.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogPostPriceRefs1778400000000 implements MigrationInterface {
  name = "AddBlogPostPriceRefs1778400000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ADD COLUMN IF NOT EXISTS "price_refs" jsonb
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "price_refs"`)
  }
}
