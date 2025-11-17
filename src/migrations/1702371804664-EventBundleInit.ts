import { MigrationInterface, QueryRunner } from "typeorm";

export class EventBundleInit1702371804664 implements MigrationInterface {
    name = 'EventBundleInit1702371804664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "event_bundle" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "post_start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "post_end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "visible_first" boolean DEFAULT false, "visible_second" boolean DEFAULT false, CONSTRAINT "PK_c14f767d4a32ad3e046154aa461" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_backup_bundle" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_a94a967d04c649e409e8c240fa3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_backup_label_enum" AS ENUM('NEW', 'BEST', 'POP', 'KAKAO')`);
        await queryRunner.query(`CREATE TABLE "event_backup" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "name_en" character varying, "name_zh" character varying, "name_ja" character varying, "name_th" character varying, "description" character varying, "description_en" character varying, "description_zh" character varying, "description_ja" character varying, "description_th" character varying, "price" integer NOT NULL, "order" integer, "order_en" integer, "order_zh" integer, "order_ja" integer, "order_th" integer, "visible" boolean, "visible_en" boolean, "visible_zh" boolean, "visible_ja" boolean, "visible_th" boolean, "label" "public"."event_backup_label_enum" array, "backup_bundle_id" uuid, "category_id" uuid, "detail_page_id" uuid, "integrated_crm_category_id" uuid, CONSTRAINT "PK_9cefdfd3f8c06db88eb1c844460" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "procedure_en" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "procedure_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "procedure_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "procedure_th" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "information_en" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "information_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "information_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "information_th" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "advantages_en" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "advantages_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "advantages_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "advantages_th" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "target_en" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "target_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "target_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "target_th" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "q_and_aen" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "q_and_azh" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "q_and_aja" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "q_and_ath" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "caution_en" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "caution_zh" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "caution_ja" character varying`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" ADD "caution_th" character varying`);
        await queryRunner.query(`ALTER TABLE "event" ADD "bundle_id" uuid`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_c14f767d4a32ad3e046154aa461" FOREIGN KEY ("bundle_id") REFERENCES "event_bundle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_backup" ADD CONSTRAINT "FK_c191233b7b927ea1e632233f243" FOREIGN KEY ("backup_bundle_id") REFERENCES "event_backup_bundle"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_backup" ADD CONSTRAINT "FK_64271d0daa9e3768e58653e4ed4" FOREIGN KEY ("category_id") REFERENCES "event_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_backup" ADD CONSTRAINT "FK_3602d27f88ffdad0ffb98400db2" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_backup" ADD CONSTRAINT "FK_846deea9b65316249d9fe6920d4" FOREIGN KEY ("integrated_crm_category_id") REFERENCES "integrated_crm_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_backup" DROP CONSTRAINT "FK_846deea9b65316249d9fe6920d4"`);
        await queryRunner.query(`ALTER TABLE "event_backup" DROP CONSTRAINT "FK_3602d27f88ffdad0ffb98400db2"`);
        await queryRunner.query(`ALTER TABLE "event_backup" DROP CONSTRAINT "FK_64271d0daa9e3768e58653e4ed4"`);
        await queryRunner.query(`ALTER TABLE "event_backup" DROP CONSTRAINT "FK_c191233b7b927ea1e632233f243"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_c14f767d4a32ad3e046154aa461"`);
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "bundle_id"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "caution_th"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "caution_ja"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "caution_zh"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "caution_en"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "q_and_ath"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "q_and_aja"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "q_and_azh"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "q_and_aen"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "target_th"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "target_ja"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "target_zh"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "target_en"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "advantages_th"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "advantages_ja"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "advantages_zh"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "advantages_en"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "information_th"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "information_ja"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "information_zh"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "information_en"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "procedure_th"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "procedure_ja"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "procedure_zh"`);
        await queryRunner.query(`ALTER TABLE "product_detail_page" DROP COLUMN "procedure_en"`);
        await queryRunner.query(`DROP TABLE "event_backup"`);
        await queryRunner.query(`DROP TYPE "public"."event_backup_label_enum"`);
        await queryRunner.query(`DROP TABLE "event_backup_bundle"`);
        await queryRunner.query(`DROP TABLE "event_bundle"`);
    }

}
