import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMemberI18nColumns1755141891844 implements MigrationInterface {
    name = 'AddMemberI18nColumns1755141891844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" ADD "name_en" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "name_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "name_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "name_th" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "description_en" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "description_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "description_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "member" ADD "description_th" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "description_th"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "description_ja"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "description_zh"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "description_en"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "name_th"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "name_ja"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "name_zh"`);
        await queryRunner.query(`ALTER TABLE "member" DROP COLUMN "name_en"`);
    }

}
