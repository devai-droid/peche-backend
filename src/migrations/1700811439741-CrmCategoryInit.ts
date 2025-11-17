import { MigrationInterface, QueryRunner } from "typeorm";

export class CrmCategoryInit1700811439741 implements MigrationInterface {
    name = 'CrmCategoryInit1700811439741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."crm_category_building_enum" AS ENUM('MAIN', 'NEW')`);
        await queryRunner.query(`CREATE TABLE "crm_category" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "code" character varying NOT NULL, "name" character varying NOT NULL, "subject_code" character varying, "subject_name" character varying, "order" integer, "building" "public"."crm_category_building_enum", CONSTRAINT "PK_2b29438361670c49eb1c977a332" PRIMARY KEY ("code"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "crm_category"`);
        await queryRunner.query(`DROP TYPE "public"."crm_category_building_enum"`);
    }

}
