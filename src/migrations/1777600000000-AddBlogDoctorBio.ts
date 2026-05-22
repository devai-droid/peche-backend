import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * blog.doctors 에 의료진 소개글(bio) 컬럼 추가.
 * 모든 블로그 글 하단 의료진 카드에 공통 노출되는 소개 문구.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogDoctorBio1777600000000 implements MigrationInterface {
  name = "AddBlogDoctorBio1777600000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."doctors" ADD COLUMN IF NOT EXISTS "bio" TEXT
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."doctors" DROP COLUMN IF EXISTS "bio"
    `)
  }
}
