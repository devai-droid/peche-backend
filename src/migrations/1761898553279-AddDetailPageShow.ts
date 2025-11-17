import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDetailPageShow1761898553279 implements MigrationInterface {
    name = 'AddDetailPageShow1761898553279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ADD "detail_page_show" boolean DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "detail_page_show"`);
    }

}
