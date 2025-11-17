import { MigrationInterface, QueryRunner } from "typeorm";

export class UserFix1703571309990 implements MigrationInterface {
    name = 'UserFix1703571309990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account_user" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "account_user" ADD CONSTRAINT "UQ_2a3f18f90f44575476018ae7f57" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "account_user" ADD "customer_number" character varying`);
        await queryRunner.query(`ALTER TABLE "account_user" ALTER COLUMN "phone_number" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account_user" ALTER COLUMN "phone_number" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account_user" DROP COLUMN "customer_number"`);
        await queryRunner.query(`ALTER TABLE "account_user" DROP CONSTRAINT "UQ_2a3f18f90f44575476018ae7f57"`);
        await queryRunner.query(`ALTER TABLE "account_user" DROP COLUMN "email"`);
    }

}
