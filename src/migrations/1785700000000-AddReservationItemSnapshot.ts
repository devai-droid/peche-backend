import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 예약 이력 보존용 상품/이벤트 스냅샷 컬럼.
 * public.reservation 에 nullable jsonb 컬럼만 추가(추가·비파괴). 기존 예약-상품/이벤트 연결(CASCADE)은 그대로 둔다.
 * 신규 예약부터 예약 당시 이름·가격·수량이 스냅샷으로 저장되어, 상품 재임포트·가격변경에도 이력이 유지된다.
 */
export class AddReservationItemSnapshot1785700000000 implements MigrationInterface {
  name = "AddReservationItemSnapshot1785700000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservation"
         ADD COLUMN IF NOT EXISTS "product_snapshot" jsonb,
         ADD COLUMN IF NOT EXISTS "event_snapshot" jsonb`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservation"
         DROP COLUMN IF EXISTS "product_snapshot",
         DROP COLUMN IF EXISTS "event_snapshot"`,
    )
  }
}
