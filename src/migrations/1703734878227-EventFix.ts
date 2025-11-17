import { MigrationInterface, QueryRunner } from "typeorm";

export class EventFix1703734878227 implements MigrationInterface {
    name = 'EventFix1703734878227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ADD "discount_price" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "discount_price"`);
    }

}
