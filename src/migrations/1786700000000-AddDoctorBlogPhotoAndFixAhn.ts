import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 1) 의료진 블로그 카드 전용 사진 컬럼(blog_photo_url) 추가.
 * 2) 안태언(블로그 연결 의료진) 사진 분리: photo_url=의료진소개 사진, blog_photo_url=기존 블로그 사진.
 * 3) 안태언 이름 보정: 영어·태국어 = "Dr. Ahn, Tae-eon", 번체(zh-TW) = "安泰彦".
 * blog 스키마, 추가·수정만.
 */
export class AddDoctorBlogPhotoAndFixAhn1786700000000 implements MigrationInterface {
  name = "AddDoctorBlogPhotoAndFixAhn1786700000000"

  private readonly webPhoto = "https://d1snu9ea4bf6mq.cloudfront.net/site-config/doctors/ahn.jpg"
  private readonly blogPhoto = "https://d1snu9ea4bf6mq.cloudfront.net/blog/doctors/antaeeon.webp"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog"."doctors" ADD COLUMN IF NOT EXISTS "blog_photo_url" varchar(500)`,
    )
    // 안태언(블로그 연결 의료진) 사진 분리
    await queryRunner.query(
      `UPDATE "blog"."doctors"
         SET "photo_url" = $1, "blog_photo_url" = $2
       WHERE "target_site" = 'peche' AND "linked_to_blog_card" = true`,
      [this.webPhoto, this.blogPhoto],
    )
    // 안태언 이름 보정(언어별 올바른 표기로)
    await queryRunner.query(
      `UPDATE "blog"."doctors" SET "name" = 'Dr. Ahn, Tae-eon'
       WHERE "target_site" = 'peche' AND "linked_to_blog_card" = true AND "lang" IN ('en','th')`,
    )
    await queryRunner.query(
      `UPDATE "blog"."doctors" SET "name" = '安泰彦'
       WHERE "target_site" = 'peche' AND "linked_to_blog_card" = true AND "lang" = 'zh-TW'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog"."doctors" DROP COLUMN IF EXISTS "blog_photo_url"`)
  }
}
