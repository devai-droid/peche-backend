import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductIdCanBeNull1761814534412 implements MigrationInterface {
    name = 'ProductIdCanBeNull1761814534412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "popular_product" DROP CONSTRAINT "FK_c8202e17c759ce3dddedb014c8b"`);
        await queryRunner.query(`ALTER TABLE "main_product" DROP CONSTRAINT "FK_86138c98ec6990c407bee5fd9b3"`);
        await queryRunner.query(`ALTER TABLE "popular_product" ALTER COLUMN "product_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "main_product" ALTER COLUMN "product_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "popular_product" ADD CONSTRAINT "FK_c8202e17c759ce3dddedb014c8b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_product" ADD CONSTRAINT "FK_86138c98ec6990c407bee5fd9b3" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "main_product" DROP CONSTRAINT "FK_86138c98ec6990c407bee5fd9b3"`);
        await queryRunner.query(`ALTER TABLE "popular_product" DROP CONSTRAINT "FK_c8202e17c759ce3dddedb014c8b"`);
        await queryRunner.query(`ALTER TABLE "main_product" ALTER COLUMN "product_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "popular_product" ALTER COLUMN "product_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "main_product" ADD CONSTRAINT "FK_86138c98ec6990c407bee5fd9b3" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "popular_product" ADD CONSTRAINT "FK_c8202e17c759ce3dddedb014c8b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
