import { MigrationInterface, QueryRunner } from "typeorm"

export class BlogInit1768300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "blog_category" (
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "created_by" character varying,
        "updated_by" character varying,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "name_en" character varying,
        "name_zh" character varying,
        "name_zhtw" character varying,
        "name_ja" character varying,
        "name_th" character varying,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_blog_category" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "blog_post" (
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "created_by" character varying,
        "updated_by" character varying,
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "title_en" character varying,
        "title_zh" character varying,
        "title_zhtw" character varying,
        "title_ja" character varying,
        "title_th" character varying,
        "summary" character varying,
        "summary_en" character varying,
        "summary_zh" character varying,
        "summary_zhtw" character varying,
        "summary_ja" character varying,
        "summary_th" character varying,
        "content" text NOT NULL,
        "content_en" text,
        "content_zh" text,
        "content_zhtw" text,
        "content_ja" text,
        "content_th" text,
        "thumbnail_url" character varying,
        "author" character varying NOT NULL,
        "visible" boolean NOT NULL DEFAULT true,
        "published_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_blog_post_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_blog_post" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "blog_post_categories_blog_category" (
        "blog_post_id" uuid NOT NULL,
        "blog_category_id" uuid NOT NULL,
        CONSTRAINT "PK_blog_post_categories" PRIMARY KEY ("blog_post_id", "blog_category_id")
      )
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_blog_post_categories_post" ON "blog_post_categories_blog_category" ("blog_post_id")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_blog_post_categories_category" ON "blog_post_categories_blog_category" ("blog_category_id")
    `)

    await queryRunner.query(`
      ALTER TABLE "blog_post_categories_blog_category"
      ADD CONSTRAINT "FK_blog_post_categories_post"
      FOREIGN KEY ("blog_post_id") REFERENCES "blog_post"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `)

    await queryRunner.query(`
      ALTER TABLE "blog_post_categories_blog_category"
      ADD CONSTRAINT "FK_blog_post_categories_category"
      FOREIGN KEY ("blog_category_id") REFERENCES "blog_category"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_post_categories_blog_category"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_post"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_category"`)
  }
}
