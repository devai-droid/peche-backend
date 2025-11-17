import { MigrationInterface, QueryRunner } from "typeorm";

export class LangCrmCategory1745540908833 implements MigrationInterface {
    name = 'LangCrmCategory1745540908833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."lang_crm_category_lang_enum" AS ENUM('ko', 'en', 'zh', 'ja', 'th')`);
        await queryRunner.query(`CREATE TYPE "public"."lang_crm_category_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TYPE "public"."lang_crm_category_building_priorities_enum" AS ENUM('BUILDING_1', 'BUILDING_2', 'BUILDING_3')`);
        await queryRunner.query(`CREATE TABLE "lang_crm_category" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lang" "public"."lang_crm_category_lang_enum" NOT NULL, "status" "public"."lang_crm_category_status_enum" NOT NULL DEFAULT 'ACTIVE', "name" character varying, "building_priorities" "public"."lang_crm_category_building_priorities_enum" array, "order" integer, "building1_crm_category_code" character varying, "building2_crm_category_code" character varying, "building3_crm_category_code" character varying, CONSTRAINT "UQ_322f90337d54047dbc6dca7ed91" UNIQUE ("lang"), CONSTRAINT "UQ_9c5e3717938ce07e312b9b15a41" UNIQUE ("status"), CONSTRAINT "PK_0e2f8e2d3264b75ed4807606fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "lang_crm_category" ADD CONSTRAINT "FK_5bcf2123bdd29e838e8758d2510" FOREIGN KEY ("building1_crm_category_code") REFERENCES "crm_category"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lang_crm_category" ADD CONSTRAINT "FK_79866e2c0807c51e493a3d698c6" FOREIGN KEY ("building2_crm_category_code") REFERENCES "crm_category"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lang_crm_category" ADD CONSTRAINT "FK_e5f237d31134db3a5bbdffdc8fd" FOREIGN KEY ("building3_crm_category_code") REFERENCES "crm_category"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lang_crm_category" DROP CONSTRAINT "FK_e5f237d31134db3a5bbdffdc8fd"`);
        await queryRunner.query(`ALTER TABLE "lang_crm_category" DROP CONSTRAINT "FK_79866e2c0807c51e493a3d698c6"`);
        await queryRunner.query(`ALTER TABLE "lang_crm_category" DROP CONSTRAINT "FK_5bcf2123bdd29e838e8758d2510"`);
        await queryRunner.query(`DROP TABLE "lang_crm_category"`);
        await queryRunner.query(`DROP TYPE "public"."lang_crm_category_building_priorities_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lang_crm_category_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lang_crm_category_lang_enum"`);
    }

}
