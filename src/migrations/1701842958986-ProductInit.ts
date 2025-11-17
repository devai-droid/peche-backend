import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductInit1701842958986 implements MigrationInterface {
    name = 'ProductInit1701842958986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_backup_bundle" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_bc352f1b35608f285c3bde29ff9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "related_product_detail_page" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_detail_page_id" uuid NOT NULL, "related_product_detail_page_id" uuid NOT NULL, CONSTRAINT "PK_2cf2d4a989282280cc318fced1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_detail_page_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "product_detail_page" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."product_detail_page_status_enum" NOT NULL DEFAULT 'ACTIVE', "name" character varying, "name_en" character varying, "name_zh" character varying, "name_ja" character varying, "name_th" character varying, "description" character varying, "description_en" character varying, "description_zh" character varying, "description_ja" character varying, "description_th" character varying, "reference_url" character varying, "procedure" character varying, "information" character varying, "advantages" character varying, "target" character varying, "q_and_a" character varying, "caution" character varying, "order" integer, "category_id" uuid, CONSTRAINT "PK_b96252bcb8b4aafddfb8848f350" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_category_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "product_category" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."product_category_status_enum" NOT NULL DEFAULT 'ACTIVE', "name" character varying, "name_en" character varying, "name_zh" character varying, "name_ja" character varying, "name_th" character varying, "order" integer, CONSTRAINT "PK_0dce9bc93c2d2c399982d04bef1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_backup" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "origin_product_id" character varying NOT NULL, "name" character varying, "name_en" character varying, "name_zh" character varying, "name_ja" character varying, "name_th" character varying, "description" character varying, "description_en" character varying, "description_zh" character varying, "description_ja" character varying, "description_th" character varying, "price" integer NOT NULL, "order" integer, "order_en" integer, "order_zh" integer, "order_ja" integer, "order_th" integer, "visible" boolean, "visible_en" boolean, "visible_zh" boolean, "visible_ja" boolean, "visible_th" boolean, "backup_bundle_id" uuid NOT NULL, "category_id" uuid, "detail_page_id" uuid, "integrated_crm_category_id" uuid, CONSTRAINT "PK_5d453ad6954c5a52befb40db4b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "name_en" character varying, "name_zh" character varying, "name_ja" character varying, "name_th" character varying, "description" character varying, "description_en" character varying, "description_zh" character varying, "description_ja" character varying, "description_th" character varying, "price" integer NOT NULL, "order" integer, "order_en" integer, "order_zh" integer, "order_ja" integer, "order_th" integer, "visible" boolean, "visible_en" boolean, "visible_zh" boolean, "visible_ja" boolean, "visible_th" boolean, "category_id" uuid, "detail_page_id" uuid, "integrated_crm_category_id" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "related_product_detail_page" ADD CONSTRAINT "FK_21787cf0b96434d65cade0b4658" FOREIGN KEY ("product_detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "related_product_detail_page" ADD CONSTRAINT "FK_e56f4c4fa9a57a1199e79c26f02" FOREIGN KEY ("related_product_detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD CONSTRAINT "FK_552652a0fcc5820798a9b00911a" FOREIGN KEY ("category_id") REFERENCES "product_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_backup" ADD CONSTRAINT "FK_21efb06fe08c6851187702c36e1" FOREIGN KEY ("backup_bundle_id") REFERENCES "product_backup_bundle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_backup" ADD CONSTRAINT "FK_0e094eeda81ae2d45cb358396a3" FOREIGN KEY ("category_id") REFERENCES "product_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_backup" ADD CONSTRAINT "FK_b8c515493a4c8112bc23e583dc9" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_backup" ADD CONSTRAINT "FK_fdf12bb0089401056a426b56576" FOREIGN KEY ("integrated_crm_category_id") REFERENCES "integrated_crm_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1" FOREIGN KEY ("category_id") REFERENCES "product_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_b96252bcb8b4aafddfb8848f350" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_68b79b7ef77c2d7ca75139dfeef" FOREIGN KEY ("integrated_crm_category_id") REFERENCES "integrated_crm_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_68b79b7ef77c2d7ca75139dfeef"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_b96252bcb8b4aafddfb8848f350"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1"`);
        await queryRunner.query(`ALTER TABLE "product_backup" DROP CONSTRAINT "FK_fdf12bb0089401056a426b56576"`);
        await queryRunner.query(`ALTER TABLE "product_backup" DROP CONSTRAINT "FK_b8c515493a4c8112bc23e583dc9"`);
        await queryRunner.query(`ALTER TABLE "product_backup" DROP CONSTRAINT "FK_0e094eeda81ae2d45cb358396a3"`);
        await queryRunner.query(`ALTER TABLE "product_backup" DROP CONSTRAINT "FK_21efb06fe08c6851187702c36e1"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP CONSTRAINT "FK_552652a0fcc5820798a9b00911a"`);
        await queryRunner.query(`ALTER TABLE "related_product_detail_page" DROP CONSTRAINT "FK_e56f4c4fa9a57a1199e79c26f02"`);
        await queryRunner.query(`ALTER TABLE "related_product_detail_page" DROP CONSTRAINT "FK_21787cf0b96434d65cade0b4658"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "product_backup"`);
        await queryRunner.query(`DROP TABLE "product_category"`);
        await queryRunner.query(`DROP TYPE "public"."product_category_status_enum"`);
        await queryRunner.query(`DROP TABLE "product_detail_page"`);
        await queryRunner.query(`DROP TYPE "public"."product_detail_page_status_enum"`);
        await queryRunner.query(`DROP TABLE "related_product_detail_page"`);
        await queryRunner.query(`DROP TABLE "product_backup_bundle"`);
    }

}
