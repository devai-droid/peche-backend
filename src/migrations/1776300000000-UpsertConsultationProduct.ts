import { MigrationInterface, QueryRunner } from "typeorm"

// frontend의 DEFAULT_CONSULTATION_PRODUCT_ID와 일치
const CONSULTATION_PRODUCT_IDS = [
  "22c0f372-754e-4f5a-93ea-9ae567fd8184", // dev / prod / staging
  "e00f590d-5920-4297-9dc6-41cdf5438ec9", // local
]

export class UpsertConsultationProduct1776300000000 implements MigrationInterface {
  name = "UpsertConsultationProduct1776300000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const id of CONSULTATION_PRODUCT_IDS) {
      await queryRunner.query(
        `INSERT INTO "product" (id, name, price) VALUES ($1, '방문 후 상담', 0)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [id],
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 안전하게 down 시 삭제만 (이전 이름 복원은 추적 불가)
    for (const id of CONSULTATION_PRODUCT_IDS) {
      await queryRunner.query(`DELETE FROM "product" WHERE id = $1`, [id])
    }
  }
}
