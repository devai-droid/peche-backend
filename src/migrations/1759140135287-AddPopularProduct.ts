import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPopularProduct1759140135287 implements MigrationInterface {
    name = 'AddPopularProduct1759140135287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."popular_product_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "popular_product" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."popular_product_status_enum" NOT NULL DEFAULT 'INACTIVE', "description" character varying, "product_name" character varying, "product_name_en" character varying, "product_name_zh" character varying, "product_name_ja" character varying, "product_name_th" character varying, "order" integer, "product_id" uuid NOT NULL, CONSTRAINT "PK_148ddb894bbf5131f1dad59ef18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "popular_product" ADD CONSTRAINT "FK_c8202e17c759ce3dddedb014c8b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "popular_product" DROP CONSTRAINT "FK_c8202e17c759ce3dddedb014c8b"`);
        await queryRunner.query(`DROP TABLE "popular_product"`);
        await queryRunner.query(`DROP TYPE "public"."popular_product_status_enum"`);
    }

}
