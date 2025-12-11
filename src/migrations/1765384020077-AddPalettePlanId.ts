import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPalettePlanId1765384020077 implements MigrationInterface {
    name = 'AddPalettePlanId1765384020077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" ADD "palette_plan_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "palette_plan_id"`);
    }

}
