import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlogKeywords1774005406812 implements MigrationInterface {
    name = 'AddBlogKeywords1774005406812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_post_categories_blog_category" DROP CONSTRAINT "FK_blog_post_categories_category"`);
        await queryRunner.query(`ALTER TABLE "blog_post_categories_blog_category" DROP CONSTRAINT "FK_blog_post_categories_post"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_blog_post_categories_post"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_blog_post_categories_category"`);
        await queryRunner.query(`ALTER TABLE "blog_post" ADD "keywords" character varying`);
        await queryRunner.query(`ALTER TABLE "blog_category" DROP COLUMN IF EXISTS "event_category_id"`);
        await queryRunner.query(`ALTER TABLE "blog_category" ADD "event_category_id" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_f146b7b8536abfac92308b66c1" ON "blog_post_categories_blog_category" ("blog_post_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_425a1f24435bbec055119a123e" ON "blog_post_categories_blog_category" ("blog_category_id") `);
        await queryRunner.query(`ALTER TABLE "blog_post_categories_blog_category" ADD CONSTRAINT "FK_f146b7b8536abfac92308b66c1a" FOREIGN KEY ("blog_post_id") REFERENCES "blog_post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "blog_post_categories_blog_category" ADD CONSTRAINT "FK_425a1f24435bbec055119a123e8" FOREIGN KEY ("blog_category_id") REFERENCES "blog_category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_post_categories_blog_category" DROP CONSTRAINT "FK_425a1f24435bbec055119a123e8"`);
        await queryRunner.query(`ALTER TABLE "blog_post_categories_blog_category" DROP CONSTRAINT "FK_f146b7b8536abfac92308b66c1a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_425a1f24435bbec055119a123e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f146b7b8536abfac92308b66c1"`);
        await queryRunner.query(`ALTER TABLE "blog_category" DROP COLUMN "event_category_id"`);
        await queryRunner.query(`ALTER TABLE "blog_category" ADD "event_category_id" uuid`);
        await queryRunner.query(`ALTER TABLE "blog_post" DROP COLUMN "keywords"`);
        await queryRunner.query(`CREATE INDEX "IDX_blog_post_categories_category" ON "blog_post_categories_blog_category" ("blog_category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_blog_post_categories_post" ON "blog_post_categories_blog_category" ("blog_post_id") `);
        await queryRunner.query(`ALTER TABLE "blog_post_categories_blog_category" ADD CONSTRAINT "FK_blog_post_categories_post" FOREIGN KEY ("blog_post_id") REFERENCES "blog_post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "blog_post_categories_blog_category" ADD CONSTRAINT "FK_blog_post_categories_category" FOREIGN KEY ("blog_category_id") REFERENCES "blog_category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
