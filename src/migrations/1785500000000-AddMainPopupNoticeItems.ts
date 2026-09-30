import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 팝업을 이미지 대신 텍스트 '휴무·안내(Information)' 형태로도 띄우기 위한 항목 컬럼.
 * public.main_popup 에 nullable jsonb 컬럼만 추가(추가·비파괴). 기존 이미지 팝업은 영향 없음.
 */
export class AddMainPopupNoticeItems1785500000000 implements MigrationInterface {
  name = "AddMainPopupNoticeItems1785500000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main_popup" ADD COLUMN IF NOT EXISTS "notice_items" jsonb`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main_popup" DROP COLUMN IF EXISTS "notice_items"`)
  }
}
