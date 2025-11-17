import { MigrationInterface, QueryRunner } from "typeorm";

export class SystemInit1703749142387 implements MigrationInterface {
    name = 'SystemInit1703749142387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."equipment_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "equipment" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."equipment_status_enum" NOT NULL DEFAULT 'INACTIVE', "name" character varying, "description_first" character varying, "description_second" character varying, "order" integer, "image_id" uuid, CONSTRAINT "PK_0722e1b9d6eb19f5874c1678740" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."main_image_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "main_image" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."main_image_status_enum" NOT NULL DEFAULT 'INACTIVE', "description" character varying, "order" integer, "image_id" uuid, CONSTRAINT "PK_61b8f40c9de3bb5132080449690" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."main_popup_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "main_popup" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."main_popup_status_enum" NOT NULL DEFAULT 'INACTIVE', "description" character varying, "order" integer, "image_id" uuid, "image_en_id" uuid, "image_zh_id" uuid, "image_ja_id" uuid, "image_th_id" uuid, CONSTRAINT "PK_a30c2b8bc41980b985a13607b88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."member_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TYPE "public"."member_occupation_enum" AS ENUM('원장', '상담실장', '코디네이터', '피부관리사', '어시스트')`);
        await queryRunner.query(`CREATE TABLE "member" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."member_status_enum" NOT NULL DEFAULT 'INACTIVE', "name" character varying, "description" character varying, "occupation" "public"."member_occupation_enum" NOT NULL, "birth_date" character varying, "phone_number" character varying, "join_date" character varying, "order" integer, "image_id" uuid, CONSTRAINT "PK_97cbbe986ce9d14ca5894fdc072" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."search_keyword_language_locale_enum" AS ENUM('KO', 'EN', 'ZH', 'JA', 'TH')`);
        await queryRunner.query(`CREATE TABLE "search_keyword" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "language_locale" "public"."search_keyword_language_locale_enum" NOT NULL DEFAULT 'KO', "keyword" character varying NOT NULL, "order" integer, CONSTRAINT "PK_3813c99bf030ab1e7c6e0ad914f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."system_constants_key_enum" AS ENUM('AUTO_RESERVATION_CONFIRM')`);
        await queryRunner.query(`CREATE TABLE "system_constants" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "key" "public"."system_constants_key_enum" NOT NULL, "value" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_a76240103ec95539175ef189469" PRIMARY KEY ("key"))`);
        await queryRunner.query(`CREATE TYPE "public"."main_product_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "main_product" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."main_product_status_enum" NOT NULL DEFAULT 'INACTIVE', "description" character varying, "order" integer, "image_id" uuid, "image_en_id" uuid, "image_zh_id" uuid, "image_ja_id" uuid, "image_th_id" uuid, "product_id" uuid NOT NULL, CONSTRAINT "PK_5a132f8eee2e7152747b230933d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."account_user_language_locale_enum" RENAME TO "account_user_language_locale_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."account_user_language_locale_enum" AS ENUM('KO', 'EN', 'ZH', 'JA', 'TH')`);
        await queryRunner.query(`ALTER TABLE "account_user" ALTER COLUMN "language_locale" TYPE "public"."account_user_language_locale_enum" USING "language_locale"::"text"::"public"."account_user_language_locale_enum"`);
        await queryRunner.query(`DROP TYPE "public"."account_user_language_locale_enum_old"`);
        await queryRunner.query(`ALTER TABLE "equipment" ADD CONSTRAINT "FK_fb81606bcf1e3ec24ba1dfb7235" FOREIGN KEY ("image_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_image" ADD CONSTRAINT "FK_0cfb53c1065d5fb3c14d48bd955" FOREIGN KEY ("image_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_popup" ADD CONSTRAINT "FK_a127750959ff62019da6cad069b" FOREIGN KEY ("image_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_popup" ADD CONSTRAINT "FK_87e1df4c4c1192ff1dc93c6e12e" FOREIGN KEY ("image_en_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_popup" ADD CONSTRAINT "FK_d5ad32b56b7099467945db32601" FOREIGN KEY ("image_zh_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_popup" ADD CONSTRAINT "FK_3e5fb28e7dd7526ea287b890337" FOREIGN KEY ("image_ja_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_popup" ADD CONSTRAINT "FK_fada3a989fefffec57668a73842" FOREIGN KEY ("image_th_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member" ADD CONSTRAINT "FK_d7a3fe6830f4d25c45463cf50c8" FOREIGN KEY ("image_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_product" ADD CONSTRAINT "FK_b468510ff30e533d207396d7b1a" FOREIGN KEY ("image_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_product" ADD CONSTRAINT "FK_6b34b730d4e68e92da6b1a600f3" FOREIGN KEY ("image_en_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_product" ADD CONSTRAINT "FK_7cbc5490f79257d90cf8b2fe7e5" FOREIGN KEY ("image_zh_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_product" ADD CONSTRAINT "FK_5f5fd6f24bb0b911baacc7c5488" FOREIGN KEY ("image_ja_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_product" ADD CONSTRAINT "FK_f1e4f054efd7c1b1ae70d52c4d2" FOREIGN KEY ("image_th_id") REFERENCES "file_object"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "main_product" ADD CONSTRAINT "FK_86138c98ec6990c407bee5fd9b3" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "main_product" DROP CONSTRAINT "FK_86138c98ec6990c407bee5fd9b3"`);
        await queryRunner.query(`ALTER TABLE "main_product" DROP CONSTRAINT "FK_f1e4f054efd7c1b1ae70d52c4d2"`);
        await queryRunner.query(`ALTER TABLE "main_product" DROP CONSTRAINT "FK_5f5fd6f24bb0b911baacc7c5488"`);
        await queryRunner.query(`ALTER TABLE "main_product" DROP CONSTRAINT "FK_7cbc5490f79257d90cf8b2fe7e5"`);
        await queryRunner.query(`ALTER TABLE "main_product" DROP CONSTRAINT "FK_6b34b730d4e68e92da6b1a600f3"`);
        await queryRunner.query(`ALTER TABLE "main_product" DROP CONSTRAINT "FK_b468510ff30e533d207396d7b1a"`);
        await queryRunner.query(`ALTER TABLE "member" DROP CONSTRAINT "FK_d7a3fe6830f4d25c45463cf50c8"`);
        await queryRunner.query(`ALTER TABLE "main_popup" DROP CONSTRAINT "FK_fada3a989fefffec57668a73842"`);
        await queryRunner.query(`ALTER TABLE "main_popup" DROP CONSTRAINT "FK_3e5fb28e7dd7526ea287b890337"`);
        await queryRunner.query(`ALTER TABLE "main_popup" DROP CONSTRAINT "FK_d5ad32b56b7099467945db32601"`);
        await queryRunner.query(`ALTER TABLE "main_popup" DROP CONSTRAINT "FK_87e1df4c4c1192ff1dc93c6e12e"`);
        await queryRunner.query(`ALTER TABLE "main_popup" DROP CONSTRAINT "FK_a127750959ff62019da6cad069b"`);
        await queryRunner.query(`ALTER TABLE "main_image" DROP CONSTRAINT "FK_0cfb53c1065d5fb3c14d48bd955"`);
        await queryRunner.query(`ALTER TABLE "equipment" DROP CONSTRAINT "FK_fb81606bcf1e3ec24ba1dfb7235"`);
        await queryRunner.query(`CREATE TYPE "public"."account_user_language_locale_enum_old" AS ENUM('ko', 'en', 'zh', 'ja', 'th')`);
        await queryRunner.query(`ALTER TABLE "account_user" ALTER COLUMN "language_locale" TYPE "public"."account_user_language_locale_enum_old" USING "language_locale"::"text"::"public"."account_user_language_locale_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."account_user_language_locale_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."account_user_language_locale_enum_old" RENAME TO "account_user_language_locale_enum"`);
        await queryRunner.query(`DROP TABLE "main_product"`);
        await queryRunner.query(`DROP TYPE "public"."main_product_status_enum"`);
        await queryRunner.query(`DROP TABLE "system_constants"`);
        await queryRunner.query(`DROP TYPE "public"."system_constants_key_enum"`);
        await queryRunner.query(`DROP TABLE "search_keyword"`);
        await queryRunner.query(`DROP TYPE "public"."search_keyword_language_locale_enum"`);
        await queryRunner.query(`DROP TABLE "member"`);
        await queryRunner.query(`DROP TYPE "public"."member_occupation_enum"`);
        await queryRunner.query(`DROP TYPE "public"."member_status_enum"`);
        await queryRunner.query(`DROP TABLE "main_popup"`);
        await queryRunner.query(`DROP TYPE "public"."main_popup_status_enum"`);
        await queryRunner.query(`DROP TABLE "main_image"`);
        await queryRunner.query(`DROP TYPE "public"."main_image_status_enum"`);
        await queryRunner.query(`DROP TABLE "equipment"`);
        await queryRunner.query(`DROP TYPE "public"."equipment_status_enum"`);
    }

}
