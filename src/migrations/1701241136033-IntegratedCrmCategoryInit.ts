import { MigrationInterface, QueryRunner } from "typeorm";

export class IntegratedCrmCategoryInit1701241136033 implements MigrationInterface {
    name = 'IntegratedCrmCategoryInit1701241136033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."integrated_crm_category_building_priority_enum" AS ENUM('MAIN', 'NEW')`);
        await queryRunner.query(`CREATE TABLE "integrated_crm_category" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "building_priority" "public"."integrated_crm_category_building_priority_enum", "order" integer, "main_building_crm_category_code" character varying, "new_building_crm_category_code" character varying, CONSTRAINT "PK_921ab55d43774b1fdd406c243dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "crm_category" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "crm_category" DROP COLUMN "building"`);
        await queryRunner.query(`DROP TYPE "public"."crm_category_building_enum"`);
        await queryRunner.query(`ALTER TABLE "crm_category" ADD "max_slot" integer`);
        await queryRunner.query(`ALTER TABLE "integrated_crm_category" ADD CONSTRAINT "FK_0ebfcf2e24b41acfc57a461a57b" FOREIGN KEY ("main_building_crm_category_code") REFERENCES "crm_category"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "integrated_crm_category" ADD CONSTRAINT "FK_39316bce817902ffd66ce0ff071" FOREIGN KEY ("new_building_crm_category_code") REFERENCES "crm_category"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP CONSTRAINT "FK_39316bce817902ffd66ce0ff071"`);
        await queryRunner.query(`ALTER TABLE "integrated_crm_category" DROP CONSTRAINT "FK_0ebfcf2e24b41acfc57a461a57b"`);
        await queryRunner.query(`ALTER TABLE "crm_category" DROP COLUMN "max_slot"`);
        await queryRunner.query(`CREATE TYPE "public"."crm_category_building_enum" AS ENUM('MAIN', 'NEW')`);
        await queryRunner.query(`ALTER TABLE "crm_category" ADD "building" "public"."crm_category_building_enum"`);
        await queryRunner.query(`ALTER TABLE "crm_category" ADD "order" integer`);
        await queryRunner.query(`DROP TABLE "integrated_crm_category"`);
        await queryRunner.query(`DROP TYPE "public"."integrated_crm_category_building_priority_enum"`);
    }

}
