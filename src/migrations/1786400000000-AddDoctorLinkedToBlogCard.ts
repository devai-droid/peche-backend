import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 의료진에 '블로그 의료진 카드 연결'(linked_to_blog_card) 플래그 추가.
 * 켠 의료진만 블로그 글 하단 카드에 쓰이고 소개글·연결링크를 노출한다.
 * 기존에 소개글(bio)이 입력된 의료진(= 현재 블로그 카드에 쓰던 안태언)에는 true로 초기화.
 * blog 스키마, 추가·수정만.
 */
export class AddDoctorLinkedToBlogCard1786400000000 implements MigrationInterface {
  name = "AddDoctorLinkedToBlogCard1786400000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog"."doctors" ADD COLUMN IF NOT EXISTS "linked_to_blog_card" boolean NOT NULL DEFAULT false`,
    )
    // 소개글이 있는(블로그 카드에 쓰이던) 의료진은 연결 ON으로 초기화
    await queryRunner.query(
      `UPDATE "blog"."doctors"
         SET "linked_to_blog_card" = true
       WHERE "bio" IS NOT NULL AND btrim("bio") <> ''`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog"."doctors" DROP COLUMN IF EXISTS "linked_to_blog_card"`)
  }
}
