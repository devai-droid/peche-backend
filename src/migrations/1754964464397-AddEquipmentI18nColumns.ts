import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEquipmentI18nColumns1754964464397 implements MigrationInterface {
    name = 'AddEquipmentI18nColumns1754964464397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "equipment" ADD "name_en" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "name_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "name_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "name_th" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "description_first_en" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "description_first_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "description_first_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "description_first_th" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "description_second_en" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "description_second_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "description_second_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD "description_second_th" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "description_second_th"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "description_second_ja"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "description_second_zh"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "description_second_en"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "description_first_th"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "description_first_ja"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "description_first_zh"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "description_first_en"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "name_th"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "name_ja"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "name_zh"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP COLUMN "name_en"`);
    }

}
