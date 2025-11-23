import { MigrationInterface, QueryRunner } from "typeorm";

export class EventCategoryImageAdd1763883598058 implements MigrationInterface {
    name = 'EventCategoryImageAdd1763883598058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_category" ADD "min_price" integer`);
        await queryRunner.query(`ALTER TABLE "event_category" ADD "discount_percent" integer`);
        await queryRunner.query(`ALTER TABLE "event_category" ADD "image_id" uuid`);
        await queryRunner.query(`ALTER TABLE "event_category" ADD CONSTRAINT "FK_ca82315820d94dd9831d062a76d" FOREIGN KEY ("image_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_category" DROP CONSTRAINT "FK_ca82315820d94dd9831d062a76d"`);
        await queryRunner.query(`ALTER TABLE "event_category" DROP COLUMN "image_id"`);
        await queryRunner.query(`ALTER TABLE "event_category" DROP COLUMN "discount_percent"`);
        await queryRunner.query(`ALTER TABLE "event_category" DROP COLUMN "min_price"`);
    }

}
