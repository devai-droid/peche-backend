import { MigrationInterface, QueryRunner } from "typeorm"

export class ProductDetailPageLanguageAssets1776000000000 implements MigrationInterface {
  name = "ProductDetailPageLanguageAssets1776000000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "reference_url_en" character varying`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "reference_url_zh" character varying`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "reference_url_zhtw" character varying`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "reference_url_ja" character varying`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "reference_url_th" character varying`)

    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "image_en_id" uuid`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "image_zh_id" uuid`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "image_zhtw_id" uuid`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "image_ja_id" uuid`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "image_th_id" uuid`)

    await queryRunner.query(
      `ALTER TABLE "product_detail_page" ADD CONSTRAINT "FK_pdp_image_en" FOREIGN KEY ("image_en_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_detail_page" ADD CONSTRAINT "FK_pdp_image_zh" FOREIGN KEY ("image_zh_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_detail_page" ADD CONSTRAINT "FK_pdp_image_zhtw" FOREIGN KEY ("image_zhtw_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_detail_page" ADD CONSTRAINT "FK_pdp_image_ja" FOREIGN KEY ("image_ja_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_detail_page" ADD CONSTRAINT "FK_pdp_image_th" FOREIGN KEY ("image_th_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP CONSTRAINT "FK_pdp_image_th"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP CONSTRAINT "FK_pdp_image_ja"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP CONSTRAINT "FK_pdp_image_zhtw"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP CONSTRAINT "FK_pdp_image_zh"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP CONSTRAINT "FK_pdp_image_en"`)

    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "image_th_id"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "image_ja_id"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "image_zhtw_id"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "image_zh_id"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "image_en_id"`)

    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "reference_url_th"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "reference_url_ja"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "reference_url_zhtw"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "reference_url_zh"`)
    await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "reference_url_en"`)
  }
}
