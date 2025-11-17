import { MigrationInterface, QueryRunner } from "typeorm";

export class KakaoBizMessage1709138134951 implements MigrationInterface {
    name = 'KakaoBizMessage1709138134951'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "kakao_notification" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "id" uuid NOT NULL, "message" text NOT NULL, CONSTRAINT "PK_3a6f4f1a0074e56ea6bbcc1c715" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "kakao_notification"`);
    }

}
