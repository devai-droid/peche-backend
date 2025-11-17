import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateIntegratedCrmCategory1745539383157 implements MigrationInterface {
  name = "UpdateIntegratedCrmCategory1745539383157"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."integrated_crm_category_building_priority_enum" RENAME TO "integrated_crm_category_building_priority_enum_old"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."integrated_crm_category_first_priority_building_enum" AS ENUM('BUILDING_1', 'BUILDING_2', 'BUILDING_3')`,
    )
    await queryRunner.query(
      `ALTER TABLE "integrated_crm_category" ALTER COLUMN "first_priority_building" TYPE "public"."integrated_crm_category_first_priority_building_enum" USING "first_priority_building"::"text"::"public"."integrated_crm_category_first_priority_building_enum"`,
    )
    await queryRunner.query(`DROP TYPE "public"."integrated_crm_category_building_priority_enum_old"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."integrated_crm_category_building_priority_enum_old" AS ENUM('BUILDING_1', 'BUILDING_2', 'BUILDING_3')`,
    )
    await queryRunner.query(
      `ALTER TABLE "integrated_crm_category" ALTER COLUMN "first_priority_building" TYPE "public"."integrated_crm_category_building_priority_enum_old" USING "first_priority_building"::"text"::"public"."integrated_crm_category_building_priority_enum_old"`,
    )
    await queryRunner.query(`DROP TYPE "public"."integrated_crm_category_first_priority_building_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."integrated_crm_category_building_priority_enum_old" RENAME TO "integrated_crm_category_building_priority_enum"`,
    )
  }
}
