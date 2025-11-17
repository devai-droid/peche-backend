import { MigrationInterface, QueryRunner } from "typeorm"

export class AuthCode1703781267237 implements MigrationInterface {
  name = "AuthCode1703781267237"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."verification_code_verification_type_enum" AS ENUM('CONFIRM', 'PASSWORD')`,
    )
    await queryRunner.query(
      `CREATE TABLE "verification_code" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "code" character varying NOT NULL, "verification_type" "public"."verification_code_verification_type_enum" NOT NULL DEFAULT 'CONFIRM', CONSTRAINT "PK_d702c086da466e5d25974512d46" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "auth_code" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "phone_number" character varying, "email" character varying, "ip" character varying NOT NULL, CONSTRAINT "PK_79343e6f9a8993c26d9047b480b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(`ALTER TABLE "account_user" ADD "profile_id" uuid`)
    await queryRunner.query(`ALTER TABLE "account_user" ALTER COLUMN "phone_number" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "account_user" ADD CONSTRAINT "FK_8b0b54966c75459226673f691d5" FOREIGN KEY ("profile_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account_user" DROP CONSTRAINT "FK_8b0b54966c75459226673f691d5"`)
    await queryRunner.query(`ALTER TABLE "account_user" ALTER COLUMN "phone_number" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "account_user" DROP COLUMN "profile_id"`)
    await queryRunner.query(`DROP TABLE "auth_code"`)
    await queryRunner.query(`DROP TABLE "verification_code"`)
    await queryRunner.query(`DROP TYPE "public"."verification_code_verification_type_enum"`)
  }
}
