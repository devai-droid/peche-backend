import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlogPostEventCategoryId1774009365004 implements MigrationInterface {
    name = 'AddBlogPostEventCategoryId1774009365004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_post" ADD "event_category_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_post" DROP COLUMN "event_category_id"`);
    }

}
