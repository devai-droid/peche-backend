import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductBackupFix1702621716311 implements MigrationInterface {
    name = 'ProductBackupFix1702621716311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_backup" ALTER COLUMN "origin_product_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_backup" ALTER COLUMN "origin_product_id" SET NOT NULL`);
    }

}
