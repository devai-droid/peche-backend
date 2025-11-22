import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductDetailPageImageAdd1763792868498 implements MigrationInterface {
    name = 'ProductDetailPageImageAdd1763792868498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "image_id" uuid`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD CONSTRAINT "FK_f7235634b701fec5c115065ae66" FOREIGN KEY ("image_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP CONSTRAINT "FK_f7235634b701fec5c115065ae66"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "image_id"`);
    }

}
