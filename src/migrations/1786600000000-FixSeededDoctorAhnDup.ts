import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 1786500000000 시드 보정.
 * 각 비(非)ko 언어엔 기존 블로그용 안태언 레코드(linked_to_blog_card=true, 2026-05-26 생성)가 이미 있었는데
 * 이름이 달라(예: "Tae-Eon, Ahn") 시드 안태언과 중복되거나 순서가 뒤로 밀렸다.
 *  1) 시드로 새로 들어간 안태언(비연결, created_at 14:50:49대)만 삭제 → 기존 연결 안태언을 대표로 유지.
 *  2) 기존 연결 안태언(비ko)을 목록 맨 앞으로(created_at을 최재형보다 앞으로 당김).
 * blog 스키마, 데이터 정리만.
 */
export class FixSeededDoctorAhnDup1786600000000 implements MigrationInterface {
  name = "FixSeededDoctorAhnDup1786600000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) 시드로 들어간 중복 안태언(비연결, 14:50:49.xxx)만 제거. ko 안태언은 linked=true라 제외됨.
    await queryRunner.query(
      `DELETE FROM "blog"."doctors"
       WHERE "target_site" = 'peche'
         AND "linked_to_blog_card" = false
         AND "created_at" >= '2026-05-22T14:50:49.000Z'::timestamptz
         AND "created_at" <  '2026-05-22T14:50:50.000Z'::timestamptz`,
    )
    // 2) 기존 연결 안태언(비ko)을 목록 맨 앞으로(최재형 14:51:49보다 앞선 시각)
    await queryRunner.query(
      `UPDATE "blog"."doctors"
         SET "created_at" = '2026-05-22T14:50:48.000Z'::timestamptz
       WHERE "target_site" = 'peche' AND "linked_to_blog_card" = true AND "lang" <> 'ko'`,
    )
  }

  public async down(): Promise<void> {
    // 데이터 정리 전용(되돌리지 않음).
  }
}
