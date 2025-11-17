import { MigrationInterface, QueryRunner } from "typeorm"

export class UserAndAuthInit1700724455425 implements MigrationInterface {
  name = "UserAndAuthInit1700724455425"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."verification_verification_type_enum" AS ENUM('CONFIRM', 'PASSWORD')`)
    await queryRunner.query(
      `CREATE TYPE "public"."account_user_provider_enum" AS ENUM('ORIGIN', 'GOOGLE', 'KAKAO', 'NAVER')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."account_user_language_locale_enum" AS ENUM('ko', 'en', 'zh', 'ja', 'th')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."account_user_status_enum" AS ENUM('UNVERIFIED', 'VERIFIED', 'INACTIVE')`,
    )
    await queryRunner.query(`CREATE TYPE "public"."account_user_roles_enum" AS ENUM('USER', 'ADMIN')`)
    await queryRunner.query(
      `CREATE TABLE "account_user" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone_number" character varying NOT NULL, "password" character varying, "name" character varying, "provider" "public"."account_user_provider_enum" NOT NULL DEFAULT 'ORIGIN', "provider_sub" character varying, "language_locale" "public"."account_user_language_locale_enum", "status" "public"."account_user_status_enum" NOT NULL DEFAULT 'UNVERIFIED', "region" character varying, "marketing_accepted" boolean, "roles" "public"."account_user_roles_enum" array NOT NULL DEFAULT '{}', "description" character varying, CONSTRAINT "UQ_2044e7b203d4723a978b1614b25" UNIQUE ("phone_number"), CONSTRAINT "PK_efef1e5fdbe318a379c06678c51" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "account_user"`)
    await queryRunner.query(`DROP TYPE "public"."account_user_roles_enum"`)
    await queryRunner.query(`DROP TYPE "public"."account_user_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."account_user_language_locale_enum"`)
    await queryRunner.query(`DROP TYPE "public"."account_user_provider_enum"`)
    await queryRunner.query(`DROP TYPE "public"."verification_verification_type_enum"`)
  }
}
