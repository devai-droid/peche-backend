import { MigrationInterface, QueryRunner } from "typeorm";

export class EventInit1702017413881 implements MigrationInterface {
    name = 'EventInit1702017413881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."event_category_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "event_category" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."event_category_status_enum" NOT NULL DEFAULT 'ACTIVE', "name" character varying, "name_en" character varying, "name_zh" character varying, "name_ja" character varying, "name_th" character varying, "description" character varying, "description_en" character varying, "description_zh" character varying, "description_ja" character varying, "description_th" character varying, "start_date" TIMESTAMP WITH TIME ZONE, "end_date" TIMESTAMP WITH TIME ZONE, "day_of_week" integer array NOT NULL DEFAULT '{}', "start_hour" integer, "start_minute" integer, "end_hour" integer, "end_minute" integer, "order" integer, CONSTRAINT "PK_697909a55bde1b28a90560f3ae2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_label_enum" AS ENUM('NEW', 'BEST', 'POP', 'KAKAO')`);
        await queryRunner.query(`CREATE TABLE "event" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "name_en" character varying, "name_zh" character varying, "name_ja" character varying, "name_th" character varying, "description" character varying, "description_en" character varying, "description_zh" character varying, "description_ja" character varying, "description_th" character varying, "price" integer NOT NULL, "order" integer, "order_en" integer, "order_zh" integer, "order_ja" integer, "order_th" integer, "visible" boolean, "visible_en" boolean, "visible_zh" boolean, "visible_ja" boolean, "visible_th" boolean, "label" "public"."event_label_enum" array, "category_id" uuid, "detail_page_id" uuid, "integrated_crm_category_id" uuid, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_697909a55bde1b28a90560f3ae2" FOREIGN KEY ("category_id") REFERENCES "event_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_f0f19d59155ab367f04c92ca0ff" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_254b1459c94fad182e6dd013ccb" FOREIGN KEY ("integrated_crm_category_id") REFERENCES "integrated_crm_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_254b1459c94fad182e6dd013ccb"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_f0f19d59155ab367f04c92ca0ff"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_697909a55bde1b28a90560f3ae2"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP TYPE "public"."event_label_enum"`);
        await queryRunner.query(`DROP TABLE "event_category"`);
        await queryRunner.query(`DROP TYPE "public"."event_category_status_enum"`);
    }

}
