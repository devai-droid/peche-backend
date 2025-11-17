import { MigrationInterface, QueryRunner } from "typeorm";

export class EventBackupCascadeDelete1756452122970 implements MigrationInterface {
    name = 'EventBackupCascadeDelete1756452122970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_backup" DROP CONSTRAINT "FK_3602d27f88ffdad0ffb98400db2"`);
        await queryRunner.query(`ALTER TABLE "event_backup" ADD CONSTRAINT "FK_3602d27f88ffdad0ffb98400db2" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_backup" DROP CONSTRAINT "FK_3602d27f88ffdad0ffb98400db2"`);
        await queryRunner.query(`ALTER TABLE "event_backup" ADD CONSTRAINT "FK_3602d27f88ffdad0ffb98400db2" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
