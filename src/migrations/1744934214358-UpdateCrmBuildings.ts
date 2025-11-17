import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateCrmBuildings1744934214358 implements MigrationInterface {
  name = "UpdateCrmBuildings1744934214358"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP CONSTRAINT "FK_39316bce817902ffd66ce0ff071"`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP CONSTRAINT "FK_0ebfcf2e24b41acfc57a461a57b"`)
    await queryRunner.query(
      `ALTER TABLE "integrated_crm_category" RENAME COLUMN "main_building_crm_category_code" TO "building1_crm_category_code"`,
    )
    await queryRunner.query(
      `ALTER TABLE "integrated_crm_category" RENAME COLUMN "new_building_crm_category_code" TO "building2_crm_category_code"`,
    )
    await queryRunner.query(
      `ALTER TABLE "integrated_crm_category" RENAME COLUMN "building_priority" TO "first_priority_building"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."integrated_crm_category_second_priority_building_enum" AS ENUM('BUILDING_1', 'BUILDING_2', 'BUILDING_3')`,
    )
    await queryRunner.query(`ALTER TABLE "integrated_crm_category"
      ADD "second_priority_building" "public"."integrated_crm_category_second_priority_building_enum"`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category"
      ADD "building3_crm_category_code" character varying`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category"
      ADD CONSTRAINT "FK_7c2673849a2dc8e3db8ad338bdc" FOREIGN KEY ("building1_crm_category_code") REFERENCES "crm_category" ("code") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category"
      ADD CONSTRAINT "FK_0d355d022c8ab6407f2be0c4805" FOREIGN KEY ("building2_crm_category_code") REFERENCES "crm_category" ("code") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category"
      ADD CONSTRAINT "FK_f0e3bbe74b6592bb8a34c42bd78" FOREIGN KEY ("building3_crm_category_code") REFERENCES "crm_category" ("code") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP CONSTRAINT "FK_f0e3bbe74b6592bb8a34c42bd78"`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP CONSTRAINT "FK_0d355d022c8ab6407f2be0c4805"`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP CONSTRAINT "FK_7c2673849a2dc8e3db8ad338bdc"`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP COLUMN "building3_crm_category_code"`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP COLUMN "second_priority_building"`)
    await queryRunner.query(`DROP TYPE "public"."integrated_crm_category_second_priority_building_enum"`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP COLUMN "first_priority_building"`)
    await queryRunner.query(`DROP TYPE "public"."integrated_crm_category_first_priority_building_enum"`)
    await queryRunner.query(
      `ALTER TABLE "integrated_crm_category" RENAME COLUMN "building2_crm_category_code" TO "new_building_crm_category_code"`,
    )
    await queryRunner.query(
      `ALTER TABLE "integrated_crm_category" RENAME COLUMN "building1_crm_category_code" TO "main_building_crm_category_code"`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."integrated_crm_category_building_priority_enum" AS ENUM('MAIN', 'NEW')`,
    )
    await queryRunner.query(`ALTER TABLE "integrated_crm_category"
      ADD "building_priority" "public"."integrated_crm_category_building_priority_enum"`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category"
      ADD CONSTRAINT "FK_0ebfcf2e24b41acfc57a461a57b" FOREIGN KEY ("main_building_crm_category_code") REFERENCES "crm_category" ("code") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    await queryRunner.query(`ALTER TABLE "integrated_crm_category"
      ADD CONSTRAINT "FK_39316bce817902ffd66ce0ff071" FOREIGN KEY ("new_building_crm_category_code") REFERENCES "crm_category" ("code") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }
}
