import { MigrationInterface, QueryRunner } from "typeorm";

export class AddZhTwToLangCrmCategoryEnum1761026927306 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TYPE "lang_crm_category_lang_enum" ADD VALUE IF NOT EXISTS 'zh-TW';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
