import { MigrationInterface, QueryRunner } from "typeorm";

export class SpecificDateFix1706511561365 implements MigrationInterface {
    name = 'SpecificDateFix1706511561365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specific_date" ADD "memo" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specific_date" DROP COLUMN "memo"`);
    }

}
