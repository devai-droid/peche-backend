import { MigrationInterface, QueryRunner } from "typeorm"

export class BuildingEnumUpdate1710411600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update reservations table - convert MAIN to BUILDING_1 and NEW to BUILDING_2
    await queryRunner.query(`
      UPDATE "reservation"
      SET "building" = 'BUILDING_1'
      WHERE "building" = 'MAIN'
    `)

    await queryRunner.query(`
      UPDATE "reservation"
      SET "building" = 'BUILDING_2'
      WHERE "building" = 'NEW'
    `)

    // Update reservation_slot table
    await queryRunner.query(`
      UPDATE "reservation_slot"
      SET "building" = 'BUILDING_1'
      WHERE "building" = 'MAIN'
    `)

    await queryRunner.query(`
      UPDATE "reservation_slot"
      SET "building" = 'BUILDING_2'
      WHERE "building" = 'NEW'
    `)

    // Update specific_date_slot table
    await queryRunner.query(`
      UPDATE "specific_date_slot"
      SET "building" = 'BUILDING_1'
      WHERE "building" = 'MAIN'
    `)

    await queryRunner.query(`
      UPDATE "specific_date_slot"
      SET "building" = 'BUILDING_2'
      WHERE "building" = 'NEW'
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes if needed - convert BUILDING_1 back to MAIN and BUILDING_2 back to NEW

    // Revert reservations table
    await queryRunner.query(`
      UPDATE "reservation"
      SET "building" = 'MAIN'
      WHERE "building" = 'BUILDING_1'
    `)

    await queryRunner.query(`
      UPDATE "reservation"
      SET "building" = 'NEW'
      WHERE "building" = 'BUILDING_2'
    `)

    // Remove any BUILDING_3 entries or convert them as needed
    await queryRunner.query(`
      UPDATE "reservation"
      SET "building" = 'NEW'
      WHERE "building" = 'BUILDING_3'
    `)

    // Revert reservation_slot table
    await queryRunner.query(`
      UPDATE "reservation_slot"
      SET "building" = 'MAIN'
      WHERE "building" = 'BUILDING_1'
    `)

    await queryRunner.query(`
      UPDATE "reservation_slot"
      SET "building" = 'NEW'
      WHERE "building" = 'BUILDING_2'
    `)

    await queryRunner.query(`
      UPDATE "reservation_slot"
      SET "building" = 'NEW'
      WHERE "building" = 'BUILDING_3'
    `)

    // Revert specific_date_slot table
    await queryRunner.query(`
      UPDATE "specific_date_slot"
      SET "building" = 'MAIN'
      WHERE "building" = 'BUILDING_1'
    `)

    await queryRunner.query(`
      UPDATE "specific_date_slot"
      SET "building" = 'NEW'
      WHERE "building" = 'BUILDING_2'
    `)

    await queryRunner.query(`
      UPDATE "specific_date_slot"
      SET "building" = 'NEW'
      WHERE "building" = 'BUILDING_3'
    `)

    // Revert any other tables that may reference the Building enum
  }
}
