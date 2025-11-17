import { MigrationInterface, QueryRunner } from "typeorm";

export class IntegratedCrmCategoryFix1701242423599 implements MigrationInterface {
    name = 'IntegratedCrmCategoryFix1701242423599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integrated_crm_category" ALTER COLUMN "name" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integrated_crm_category" ALTER COLUMN "name" SET NOT NULL`);
    }

}
