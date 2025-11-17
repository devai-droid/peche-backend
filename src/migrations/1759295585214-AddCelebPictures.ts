import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCelebPictures1759295585214 implements MigrationInterface {
    name = 'AddCelebPictures1759295585214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."celeb_pictures_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "celeb_pictures" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."celeb_pictures_status_enum" NOT NULL DEFAULT 'INACTIVE', "name" character varying, "name_en" character varying, "name_zh" character varying, "name_ja" character varying, "name_th" character varying, "occupation" character varying, "occupation_en" character varying, "occupation_zh" character varying, "occupation_ja" character varying, "occupation_th" character varying, "main_page_order" integer, "archive_page_order" integer, "image_id" uuid, "image_en_id" uuid, "image_zh_id" uuid, "image_ja_id" uuid, "image_th_id" uuid, CONSTRAINT "PK_66f4bc573efff590885249688cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "celeb_pictures" ADD CONSTRAINT "FK_2e01269ee0a6bbc52484536f73f" FOREIGN KEY ("image_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "celeb_pictures" ADD CONSTRAINT "FK_4691b401946dcb1b3e5ecd0e90e" FOREIGN KEY ("image_en_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "celeb_pictures" ADD CONSTRAINT "FK_763f9c215b16648a5cdbdc1d70d" FOREIGN KEY ("image_zh_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "celeb_pictures" ADD CONSTRAINT "FK_d0673b87317ff580b514aa67abb" FOREIGN KEY ("image_ja_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "celeb_pictures" ADD CONSTRAINT "FK_3ecaa252b23a24fd016f250ba05" FOREIGN KEY ("image_th_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "celeb_pictures" DROP CONSTRAINT "FK_3ecaa252b23a24fd016f250ba05"`);
        await queryRunner.query(`ALTER TABLE "celeb_pictures" DROP CONSTRAINT "FK_d0673b87317ff580b514aa67abb"`);
        await queryRunner.query(`ALTER TABLE "celeb_pictures" DROP CONSTRAINT "FK_763f9c215b16648a5cdbdc1d70d"`);
        await queryRunner.query(`ALTER TABLE "celeb_pictures" DROP CONSTRAINT "FK_4691b401946dcb1b3e5ecd0e90e"`);
        await queryRunner.query(`ALTER TABLE "celeb_pictures" DROP CONSTRAINT "FK_2e01269ee0a6bbc52484536f73f"`);
        await queryRunner.query(`DROP TABLE "celeb_pictures"`);
        await queryRunner.query(`DROP TYPE "public"."celeb_pictures_status_enum"`);
    }

}
