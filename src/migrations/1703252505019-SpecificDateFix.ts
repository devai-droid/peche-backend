import { MigrationInterface, QueryRunner } from "typeorm";

export class SpecificDateFix1703252505019 implements MigrationInterface {
    name = 'SpecificDateFix1703252505019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "specific_date" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_1b851e7d0b914790c8f3f48d48f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "specific_date_slot" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "building" character varying NOT NULL, "hour" integer NOT NULL, "minutes" integer NOT NULL DEFAULT '0', "max_slot" integer NOT NULL DEFAULT '0', "specific_date_id" uuid NOT NULL, CONSTRAINT "PK_dc34358d060909e04ccd7c48f4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "specific_date_slot" ADD CONSTRAINT "FK_ee7f8c2cf22e3291a94826f4ca9" FOREIGN KEY ("specific_date_id") REFERENCES "specific_date"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "specific_date_slot" DROP CONSTRAINT "FK_ee7f8c2cf22e3291a94826f4ca9"`);
        await queryRunner.query(`DROP TABLE "specific_date_slot"`);
        await queryRunner.query(`DROP TABLE "specific_date"`);
    }

}
