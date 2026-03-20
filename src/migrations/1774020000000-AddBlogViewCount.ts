import { MigrationInterface, QueryRunner } from "typeorm"

export class AddBlogViewCount1774020000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog_post" ADD IF NOT EXISTS "view_count" integer NOT NULL DEFAULT 0`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog_post" DROP COLUMN IF EXISTS "view_count"`)
  }
}
