import { MigrationInterface, QueryRunner } from "typeorm";

export class FileObjectInit1703162299033 implements MigrationInterface {
    name = 'FileObjectInit1703162299033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file_object" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL, "directory" character varying NOT NULL, "bucket_name" character varying NOT NULL, "user_id" character varying, CONSTRAINT "PK_1994186c0a6bafbb6ccc8bc1853" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "file_object"`);
    }

}
