import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * reservation 에 palette_schedule_id 컬럼 추가.
 * 홈페이지 예약 분류(A 초진 / B 재진 보유권 / C 제모 보유권)에 따라 라우팅된
 * 닥터팔레트 스케줄 ID를 저장 → 예약 수정 시 원본 스케줄을 유지하기 위함.
 *
 * 기존 컬럼 무손, nullable 신규 컬럼만 추가 (운영 안전).
 */
export class AddReservationPaletteScheduleId1778100000000 implements MigrationInterface {
  name = "AddReservationPaletteScheduleId1778100000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reservation" ADD COLUMN IF NOT EXISTS "palette_schedule_id" character varying
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reservation" DROP COLUMN IF EXISTS "palette_schedule_id"
    `)
  }
}
