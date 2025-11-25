import { MigrationInterface, QueryRunner } from "typeorm";

export class MostPopularCategoryAdd1763971309715 implements MigrationInterface {
    name = 'MostPopularCategoryAdd1763971309715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "most_popular_category" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL DEFAULT 'ACTIVE', "name" character varying, "name_en" character varying, "name_zh" character varying, "name_zhtw" character varying, "name_ja" character varying, "name_th" character varying, "keywords" text array, "keywords_en" text array, "keywords_zh" text array, "keywords_zhtw" text array, "keywords_ja" text array, "keywords_th" text array, "order" integer, CONSTRAINT "PK_fa3d15ab0de6ca177e3f9f0250e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "most_popular_item" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying, "title_en" character varying, "title_zh" character varying, "title_zhtw" character varying, "title_ja" character varying, "title_th" character varying, "product_detail_page_id" character varying, "order" integer, "category_id" uuid, "image_id" uuid, CONSTRAINT "PK_1705e76f68d8c611a4bc9249f7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "most_popular_item" ADD CONSTRAINT "FK_0c81abcfa2eed99f2e91e32d823" FOREIGN KEY ("category_id") REFERENCES "most_popular_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "most_popular_item" ADD CONSTRAINT "FK_f8e61376be933ed6fa7f03bb66a" FOREIGN KEY ("image_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "most_popular_item" DROP CONSTRAINT "FK_f8e61376be933ed6fa7f03bb66a"`);
        await queryRunner.query(`ALTER TABLE "most_popular_item" DROP CONSTRAINT "FK_0c81abcfa2eed99f2e91e32d823"`);
        await queryRunner.query(`DROP TABLE "most_popular_item"`);
        await queryRunner.query(`DROP TABLE "most_popular_category"`);
    }

}
