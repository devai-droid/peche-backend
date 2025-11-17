import { MigrationInterface, QueryRunner } from "typeorm"

export class IntegratedCrmCategoryBuildingUpdate1744635754000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 먼저 enum 타입을 업데이트합니다
    await queryRunner.query(`
      ALTER TYPE "public"."integrated_crm_category_building_priority_enum"
      RENAME TO "integrated_crm_category_building_priority_enum_old"
    `)

    await queryRunner.query(`
      CREATE TYPE "public"."integrated_crm_category_building_priority_enum"
      AS ENUM('BUILDING_1', 'BUILDING_2', 'BUILDING_3')
    `)

    // 임시 컬럼을 생성하고 데이터를 이동합니다
    await queryRunner.query(`
        ALTER TABLE "integrated_crm_category"
            ADD COLUMN "building_priority_new" "public"."integrated_crm_category_building_priority_enum"
    `)

    // MAIN을 BUILDING_1로 변환
    await queryRunner.query(`
        UPDATE "integrated_crm_category"
        SET "building_priority_new" = 'BUILDING_1'
        WHERE "building_priority" = 'MAIN'
    `)

    // NEW를 BUILDING_2로 변환
    await queryRunner.query(`
        UPDATE "integrated_crm_category"
        SET "building_priority_new" = 'BUILDING_2'
        WHERE "building_priority" = 'NEW'
    `)

    // 기존 컬럼을 삭제하고 새 컬럼을 원래 이름으로 변경
    await queryRunner.query(`
        ALTER TABLE "integrated_crm_category" DROP COLUMN "building_priority"
    `)

    await queryRunner.query(`
        ALTER TABLE "integrated_crm_category"
            RENAME COLUMN "building_priority_new" TO "building_priority"
    `)

    // 이전 enum 타입을 삭제
    await queryRunner.query(`
      DROP TYPE "public"."integrated_crm_category_building_priority_enum_old"
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 원복 시 역순으로 진행
    await queryRunner.query(`
      ALTER TYPE "public"."integrated_crm_category_building_priority_enum"
      RENAME TO "integrated_crm_category_building_priority_enum_new"
    `)

    await queryRunner.query(`
      CREATE TYPE "public"."integrated_crm_category_building_priority_enum"
      AS ENUM('MAIN', 'NEW')
    `)

    // 임시 컬럼을 생성하고 데이터를 이동합니다
    await queryRunner.query(`
        ALTER TABLE "integrated_crm_category"
            ADD COLUMN "building_priority_old" "public"."integrated_crm_category_building_priority_enum"
    `)

    // BUILDING_1을 MAIN으로 원복
    await queryRunner.query(`
        UPDATE "integrated_crm_category"
        SET "building_priority_old" = 'MAIN'
        WHERE "building_priority" = 'BUILDING_1'
    `)

    // BUILDING_2를 NEW로 원복
    await queryRunner.query(`
        UPDATE "integrated_crm_category"
        SET "building_priority_old" = 'NEW'
        WHERE "building_priority" = 'BUILDING_2'
    `)

    // BUILDING_3를 NEW로 변환
    await queryRunner.query(`
        UPDATE "integrated_crm_category"
        SET "building_priority_old" = 'NEW'
        WHERE "building_priority" = 'BUILDING_3'
    `)

    // 기존 컬럼을 삭제하고 새 컬럼을 원래 이름으로 변경
    await queryRunner.query(`
        ALTER TABLE "integrated_crm_category" DROP COLUMN "building_priority"
    `)

    await queryRunner.query(`
        ALTER TABLE "integrated_crm_category"
            RENAME COLUMN "building_priority_old" TO "building_priority"
    `)

    // 임시 enum 타입을 삭제
    await queryRunner.query(`
      DROP TYPE "public"."integrated_crm_category_building_priority_enum_new"
    `)
  }
}
