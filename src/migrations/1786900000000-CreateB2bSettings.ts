import { MigrationInterface, QueryRunner } from "typeorm"

/** B2B 사이트 설정값(예약 화면 안내 문구 등). b2b schema 내부 신규 테이블. 롤백: DROP TABLE b2b.settings */
export class CreateB2bSettings1786900000000 implements MigrationInterface {
  name = "CreateB2bSettings1786900000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "b2b"."settings" (
        "key" VARCHAR(100) NOT NULL,
        "value" TEXT,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_by" VARCHAR,
        CONSTRAINT "pk_b2b_settings" PRIMARY KEY ("key")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "b2b"."settings"`)
  }
}
