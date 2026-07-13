import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 스키마 속성 마스터 — blog.schema_attributes.
 *
 * 시술(상세페이지)·대분류마다 붙일 schema.org 속성을 "한 번" 등록해두는 표.
 * 글을 쓸 때 마케터는 product_page만 적으면, 사이트가 그 상세페이지 + 소속 대분류의
 * 속성을 여기서 찾아 BlogPosting.about 노드에 자동으로 붙인다.
 * (속성은 글이 아니라 시술의 고유 정보 → 여기서 고치면 기존 글 재업로드 없이 전 글에 반영)
 *
 * attributes는 자유 키-값(jsonb): {"@type","procedureType","bodyLocation","signOrSymptom",...}
 * 코드가 키를 고정하지 않고 그대로 스키마에 통과시킨다.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogSchemaAttributes1778900000000 implements MigrationInterface {
  name = "AddBlogSchemaAttributes1778900000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "blog"."schema_attributes" (
        "created_at"  timestamptz  NOT NULL DEFAULT now(),
        "updated_at"  timestamptz  NOT NULL DEFAULT now(),
        "created_by"  varchar,
        "updated_by"  varchar,
        "id"          uuid         NOT NULL DEFAULT gen_random_uuid(),
        "target_type" varchar(20)  NOT NULL,
        "name"        varchar(200) NOT NULL,
        "attributes"  jsonb,
        CONSTRAINT "pk_blog_schema_attributes" PRIMARY KEY ("id")
      )
    `)
    // target_type: 'category'(상품 대분류) | 'detail_page'(상세페이지=시술). 이름으로 매칭하므로 (타입,이름) 유일.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_blog_schema_attributes_target_name"
        ON "blog"."schema_attributes" ("target_type", "name")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "blog"."schema_attributes"`)
  }
}
