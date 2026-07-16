import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 스키마 속성 양식 업로드 이력 — blog.schema_sync_logs.
 * sync-md 실행 1회 = 1행. 어드민 수정 이력 표에 노출(언제/누가/몇 건).
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogSchemaSyncLogs1784300000000 implements MigrationInterface {
  name = "AddBlogSchemaSyncLogs1784300000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "blog"."schema_sync_logs" (
        "created_at"      timestamptz NOT NULL DEFAULT now(),
        "updated_at"      timestamptz NOT NULL DEFAULT now(),
        "created_by"      varchar,
        "updated_by"      varchar,
        "id"              uuid        NOT NULL DEFAULT gen_random_uuid(),
        "synced_by"       varchar,
        "added"           int         NOT NULL DEFAULT 0,
        "updated"         int         NOT NULL DEFAULT 0,
        "deleted"         int         NOT NULL DEFAULT 0,
        "total"           int         NOT NULL DEFAULT 0,
        "unmatched_count" int         NOT NULL DEFAULT 0,
        CONSTRAINT "pk_blog_schema_sync_logs" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_blog_schema_sync_logs_created_at"
        ON "blog"."schema_sync_logs" ("created_at" DESC)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "blog"."schema_sync_logs"`)
  }
}
