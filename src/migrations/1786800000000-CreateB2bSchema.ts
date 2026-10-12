import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * B2B 폐쇄몰(협약 기업 직원 전용 예약) 신규 schema.
 * 운영 public.* 테이블 무손. 예약·회원은 FK 없이 id 로만 연결(애플리케이션 조인).
 *
 * 롤백: DROP SCHEMA b2b CASCADE 한 줄로 완전 제거.
 */
export class CreateB2bSchema1786800000000 implements MigrationInterface {
  name = "CreateB2bSchema1786800000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "b2b"`)

    await queryRunner.query(`
      CREATE TABLE "b2b"."companies" (
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" VARCHAR,
        "updated_by" VARCHAR,
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        "email_domains" TEXT[] NOT NULL DEFAULT '{}',
        "discount_rate" NUMERIC(5,2),
        "discount_note" VARCHAR(200),
        "contract_start" DATE,
        "contract_end" DATE,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "memo" TEXT,
        CONSTRAINT "pk_b2b_companies" PRIMARY KEY ("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_b2b_companies_domains" ON "b2b"."companies" USING GIN ("email_domains")`)

    await queryRunner.query(`
      CREATE TABLE "b2b"."verifications" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "company_id" UUID NOT NULL,
        "user_id" UUID NOT NULL,
        "email" VARCHAR(200) NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "phone" VARCHAR(30) NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "used_at" TIMESTAMPTZ,
        CONSTRAINT "pk_b2b_verifications" PRIMARY KEY ("id"),
        CONSTRAINT "fk_b2b_verifications_company" FOREIGN KEY ("company_id") REFERENCES "b2b"."companies"("id")
      )
    `)
    await queryRunner.query(`CREATE INDEX "idx_b2b_verifications_company" ON "b2b"."verifications" ("company_id")`)

    await queryRunner.query(`
      CREATE TABLE "b2b"."reservations" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "reservation_id" UUID NOT NULL,
        "company_id" UUID NOT NULL,
        "verification_id" UUID NOT NULL,
        "company_name" VARCHAR(100) NOT NULL,
        "discount_rate" NUMERIC(5,2),
        "discount_note" VARCHAR(200),
        "email" VARCHAR(200) NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "phone" VARCHAR(30) NOT NULL,
        CONSTRAINT "pk_b2b_reservations" PRIMARY KEY ("id"),
        CONSTRAINT "fk_b2b_reservations_company" FOREIGN KEY ("company_id") REFERENCES "b2b"."companies"("id"),
        CONSTRAINT "fk_b2b_reservations_verification" FOREIGN KEY ("verification_id") REFERENCES "b2b"."verifications"("id")
      )
    `)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_b2b_reservations_reservation" ON "b2b"."reservations" ("reservation_id")`,
    )
    await queryRunner.query(`CREATE INDEX "idx_b2b_reservations_company" ON "b2b"."reservations" ("company_id")`)
    await queryRunner.query(`CREATE INDEX "idx_b2b_reservations_email" ON "b2b"."reservations" ("email")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS "b2b" CASCADE`)
  }
}
