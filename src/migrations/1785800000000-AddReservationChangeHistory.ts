import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 예약 변경 이력(일시 변경 기록) 컬럼. public.reservation 에 nullable jsonb 컬럼만 추가(추가·비파괴).
 * 신규 변경부터 기존→변경 일시가 누적되어, 예약 상세 '예약변경내역'에 노출된다.
 */
export class AddReservationChangeHistory1785800000000 implements MigrationInterface {
  name = "AddReservationChangeHistory1785800000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservation" ADD COLUMN IF NOT EXISTS "change_history" jsonb`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN IF EXISTS "change_history"`)
  }
}
