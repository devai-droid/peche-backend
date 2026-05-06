import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 블로그 v2 신규 schema 생성.
 * 운영 public.* 테이블 무손. 모든 신규 테이블은 별도 blog schema에 격리.
 *
 * 롤백: DROP SCHEMA blog CASCADE 한 줄로 완전 제거.
 */
export class CreateBlogSchemaV21777200000000 implements MigrationInterface {
  name = "CreateBlogSchemaV21777200000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "blog"`)

    await queryRunner.query(`
      CREATE TABLE "blog"."doctors" (
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" VARCHAR,
        "updated_by" VARCHAR,
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        "specialty" VARCHAR(200),
        "job_title" VARCHAR(200),
        "associations" TEXT[],
        "license_number" VARCHAR(50),
        "profile_url" VARCHAR(500),
        "photo_url" VARCHAR(500),
        "is_visible" BOOLEAN NOT NULL DEFAULT true,
        "target_site" VARCHAR(50) NOT NULL DEFAULT 'peche',
        CONSTRAINT "pk_blog_doctors" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "idx_blog_doctors_visible" ON "blog"."doctors" ("is_visible") WHERE "is_visible" = true`,
    )

    await queryRunner.query(`
      CREATE TABLE "blog"."keywords" (
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" VARCHAR,
        "updated_by" VARCHAR,
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "keyword" VARCHAR(100) NOT NULL,
        "thumbnail_url" VARCHAR(500),
        "description" TEXT,
        "product_category_id" UUID,
        "target_site" VARCHAR(50) NOT NULL DEFAULT 'peche',
        CONSTRAINT "pk_blog_keywords" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "idx_blog_keywords_keyword" ON "blog"."keywords" ("keyword")`,
    )
    await queryRunner.query(
      `CREATE INDEX "idx_blog_keywords_product_category" ON "blog"."keywords" ("product_category_id")`,
    )

    await queryRunner.query(`
      CREATE TABLE "blog"."posts" (
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" VARCHAR,
        "updated_by" VARCHAR,
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "lang" VARCHAR(10) NOT NULL DEFAULT 'ko',
        "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
        "target_site" VARCHAR(50) NOT NULL DEFAULT 'peche',
        "title" VARCHAR(500) NOT NULL,
        "subtitle" VARCHAR(500),
        "body_md" TEXT NOT NULL,
        "body_html" TEXT,
        "thumbnail_url" VARCHAR(500),
        "slug" VARCHAR(255) NOT NULL,
        "summary_text" TEXT,
        "main_keyword" VARCHAR(100),
        "sub_keywords" TEXT[],
        "keyword_id" UUID,
        "product_category_id" UUID,
        "author_doctor_id" UUID,
        "published_at" TIMESTAMPTZ,
        "view_count" INT NOT NULL DEFAULT 0,
        CONSTRAINT "pk_blog_posts" PRIMARY KEY ("id"),
        CONSTRAINT "uq_blog_posts_slug_lang" UNIQUE ("slug", "lang"),
        CONSTRAINT "fk_blog_posts_keyword" FOREIGN KEY ("keyword_id")
          REFERENCES "blog"."keywords"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_blog_posts_author_doctor" FOREIGN KEY ("author_doctor_id")
          REFERENCES "blog"."doctors"("id") ON DELETE SET NULL
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_status" ON "blog"."posts" ("status")`,
    )
    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_lang_status" ON "blog"."posts" ("lang", "status")`,
    )
    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_published_at" ON "blog"."posts" ("published_at" DESC)`,
    )
    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_main_keyword" ON "blog"."posts" ("main_keyword")`,
    )
    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_product_category" ON "blog"."posts" ("product_category_id")`,
    )
    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_author_doctor" ON "blog"."posts" ("author_doctor_id")`,
    )

    await queryRunner.query(`
      CREATE TABLE "blog"."post_slug_history" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" UUID NOT NULL,
        "old_slug" VARCHAR(255) NOT NULL,
        "lang" VARCHAR(10) NOT NULL,
        "changed_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_blog_post_slug_history" PRIMARY KEY ("id"),
        CONSTRAINT "fk_blog_post_slug_history_post" FOREIGN KEY ("post_id")
          REFERENCES "blog"."posts"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "idx_blog_post_slug_history_old_slug" ON "blog"."post_slug_history" ("old_slug", "lang")`,
    )
    await queryRunner.query(
      `CREATE INDEX "idx_blog_post_slug_history_post" ON "blog"."post_slug_history" ("post_id")`,
    )

    await queryRunner.query(`
      CREATE TABLE "blog"."post_citations" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" UUID NOT NULL,
        "url" VARCHAR(500) NOT NULL,
        "title" VARCHAR(500),
        "publisher" VARCHAR(200),
        "quote" TEXT,
        "order_num" INT NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "pk_blog_post_citations" PRIMARY KEY ("id"),
        CONSTRAINT "fk_blog_post_citations_post" FOREIGN KEY ("post_id")
          REFERENCES "blog"."posts"("id") ON DELETE CASCADE
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "idx_blog_post_citations_post_order" ON "blog"."post_citations" ("post_id", "order_num")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS "blog" CASCADE`)
  }
}
