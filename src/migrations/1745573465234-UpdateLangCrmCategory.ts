import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLangCrmCategory1745573465234 implements MigrationInterface {
    name = 'UpdateLangCrmCategory1745573465234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lang_crm_category" DROP CONSTRAINT "UQ_9c5e3717938ce07e312b9b15a41"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lang_crm_category" ADD CONSTRAINT "UQ_9c5e3717938ce07e312b9b15a41" UNIQUE ("status")`);
    }

}
