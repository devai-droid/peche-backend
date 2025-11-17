import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductBackupCascadeDelete1756454802979 implements MigrationInterface {
    name = 'ProductBackupCascadeDelete1756454802979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_backup" DROP CONSTRAINT "FK_b8c515493a4c8112bc23e583dc9"`);
        await queryRunner.query(`ALTER TABLE "product_backup" ADD CONSTRAINT "FK_b8c515493a4c8112bc23e583dc9" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_backup" DROP CONSTRAINT "FK_b8c515493a4c8112bc23e583dc9"`);
        await queryRunner.query(`ALTER TABLE "product_backup" ADD CONSTRAINT "FK_b8c515493a4c8112bc23e583dc9" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
