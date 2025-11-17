import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReservation1745894054002 implements MigrationInterface {
    name = 'UpdateReservation1745894054002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" ADD "lang_crm_category_id" uuid`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_637c4c96c29293a217453f2e2d5"`);
        await queryRunner.query(`ALTER TABLE "reservation" ALTER COLUMN "integrated_crm_category_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_637c4c96c29293a217453f2e2d5" FOREIGN KEY ("integrated_crm_category_id") REFERENCES "integrated_crm_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_01fc6f0805d4115c36cf0b5c33b" FOREIGN KEY ("lang_crm_category_id") REFERENCES "lang_crm_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_01fc6f0805d4115c36cf0b5c33b"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_637c4c96c29293a217453f2e2d5"`);
        await queryRunner.query(`ALTER TABLE "reservation" ALTER COLUMN "integrated_crm_category_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_637c4c96c29293a217453f2e2d5" FOREIGN KEY ("integrated_crm_category_id") REFERENCES "integrated_crm_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP COLUMN "lang_crm_category_id"`);
    }

}
