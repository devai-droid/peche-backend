import { MigrationInterface, QueryRunner } from "typeorm"

export class MainPopupDateRange1776100000000 implements MigrationInterface {
  name = "MainPopupDateRange1776100000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main_popup" ADD "start_date" TIMESTAMP WITH TIME ZONE`)
    await queryRunner.query(`ALTER TABLE "main_popup" ADD "end_date" TIMESTAMP WITH TIME ZONE`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "main_popup" DROP COLUMN "end_date"`)
    await queryRunner.query(`ALTER TABLE "main_popup" DROP COLUMN "start_date"`)
  }
}
