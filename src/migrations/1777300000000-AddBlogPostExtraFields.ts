import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * blog.posts에 마케터 표준 스펙 대응 컬럼 추가.
 * - extra_jsonld: medical_schema (글 주인공 JSON-LD) 저장 → 렌더 시 head 주입
 * - schema_type: 글 유형 (MedicalProcedure/MedicalCondition/HowTo/Article)
 * - internal_links: 관련 글 섹션 [{anchor, slug}]
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogPostExtraFields1777300000000 implements MigrationInterface {
  name = "AddBlogPostExtraFields1777300000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts"
        ADD COLUMN IF NOT EXISTS "extra_jsonld" JSONB,
        ADD COLUMN IF NOT EXISTS "schema_type" VARCHAR(50),
        ADD COLUMN IF NOT EXISTS "internal_links" JSONB
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts"
        DROP COLUMN IF EXISTS "extra_jsonld",
        DROP COLUMN IF EXISTS "schema_type",
        DROP COLUMN IF EXISTS "internal_links"
    `)
  }
}
