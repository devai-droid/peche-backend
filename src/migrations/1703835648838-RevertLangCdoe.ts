import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertLangCdoe1703835648838 implements MigrationInterface {
    name = 'RevertLangCdoe1703835648838'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."account_user_language_locale_enum" RENAME TO "account_user_language_locale_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."account_user_language_locale_enum" AS ENUM('ko', 'en', 'zh', 'ja', 'th')`);
        await queryRunner.query(`ALTER TABLE "account_user" ALTER COLUMN "language_locale" TYPE "public"."account_user_language_locale_enum" USING "language_locale"::"text"::"public"."account_user_language_locale_enum"`);
        await queryRunner.query(`DROP TYPE "public"."account_user_language_locale_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."search_keyword_language_locale_enum" RENAME TO "search_keyword_language_locale_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."search_keyword_language_locale_enum" AS ENUM('ko', 'en', 'zh', 'ja', 'th')`);
        await queryRunner.query(`ALTER TABLE "search_keyword" ALTER COLUMN "language_locale" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "search_keyword" ALTER COLUMN "language_locale" TYPE "public"."search_keyword_language_locale_enum" USING "language_locale"::"text"::"public"."search_keyword_language_locale_enum"`);
        await queryRunner.query(`ALTER TABLE "search_keyword" ALTER COLUMN "language_locale" SET DEFAULT 'ko'`);
        await queryRunner.query(`DROP TYPE "public"."search_keyword_language_locale_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."search_keyword_language_locale_enum_old" AS ENUM('KO', 'EN', 'ZH', 'JA', 'TH')`);
        await queryRunner.query(`ALTER TABLE "search_keyword" ALTER COLUMN "language_locale" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "search_keyword" ALTER COLUMN "language_locale" TYPE "public"."search_keyword_language_locale_enum_old" USING "language_locale"::"text"::"public"."search_keyword_language_locale_enum_old"`);
        await queryRunner.query(`ALTER TABLE "search_keyword" ALTER COLUMN "language_locale" SET DEFAULT 'KO'`);
        await queryRunner.query(`DROP TYPE "public"."search_keyword_language_locale_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."search_keyword_language_locale_enum_old" RENAME TO "search_keyword_language_locale_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."account_user_language_locale_enum_old" AS ENUM('KO', 'EN', 'ZH', 'JA', 'TH')`);
        await queryRunner.query(`ALTER TABLE "account_user" ALTER COLUMN "language_locale" TYPE "public"."account_user_language_locale_enum_old" USING "language_locale"::"text"::"public"."account_user_language_locale_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."account_user_language_locale_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."account_user_language_locale_enum_old" RENAME TO "account_user_language_locale_enum"`);
    }

}
