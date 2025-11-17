import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHospitalInfoEmailLanguage1756112842782 implements MigrationInterface {
    name = 'AddHospitalInfoEmailLanguage1756112842782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_building_two" character varying`);
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_building_three" character varying`);
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_en_building_two" character varying`);
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_en_building_three" character varying`);
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_zh_building_two" character varying`);
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_zh_building_three" character varying`);
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_ja_building_two" character varying`);
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_ja_building_three" character varying`);
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_th_building_two" character varying`);
        await queryRunner.query(`ALTER TABLE "hospital_info" ADD "confirmation_email_th_building_three" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_th_building_three"`);
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_th_building_two"`);
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_ja_building_three"`);
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_ja_building_two"`);
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_zh_building_three"`);
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_zh_building_two"`);
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_en_building_three"`);
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_en_building_two"`);
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_building_three"`);
        await queryRunner.query(`ALTER TABLE "hospital_info" DROP COLUMN "confirmation_email_building_two"`);
    }

}
