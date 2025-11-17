import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeletesForDetailPage1756460630062 implements MigrationInterface {
    name = 'AddCascadeDeletesForDetailPage1756460630062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_b96252bcb8b4aafddfb8848f350"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_f0f19d59155ab367f04c92ca0ff"`);
        await queryRunner.query(`ALTER TABLE "reservation_product" DROP CONSTRAINT "FK_df79be81114097a2a408dc0475b"`);
        await queryRunner.query(`ALTER TABLE "reservation_event" DROP CONSTRAINT "FK_deb5ad40aae67c5a0db2f4bd77b"`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_b96252bcb8b4aafddfb8848f350" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_f0f19d59155ab367f04c92ca0ff" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_product" ADD CONSTRAINT "FK_df79be81114097a2a408dc0475b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_event" ADD CONSTRAINT "FK_deb5ad40aae67c5a0db2f4bd77b" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation_event" DROP CONSTRAINT "FK_deb5ad40aae67c5a0db2f4bd77b"`);
        await queryRunner.query(`ALTER TABLE "reservation_product" DROP CONSTRAINT "FK_df79be81114097a2a408dc0475b"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_f0f19d59155ab367f04c92ca0ff"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_b96252bcb8b4aafddfb8848f350"`);
        await queryRunner.query(`ALTER TABLE "reservation_event" ADD CONSTRAINT "FK_deb5ad40aae67c5a0db2f4bd77b" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_product" ADD CONSTRAINT "FK_df79be81114097a2a408dc0475b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_f0f19d59155ab367f04c92ca0ff" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_b96252bcb8b4aafddfb8848f350" FOREIGN KEY ("detail_page_id") REFERENCES "product_detail_page"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
