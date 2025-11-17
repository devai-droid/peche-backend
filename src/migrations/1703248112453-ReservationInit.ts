import { MigrationInterface, QueryRunner } from "typeorm";

export class ReservationInit1703248112453 implements MigrationInterface {
    name = 'ReservationInit1703248112453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "close_day" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "memo" character varying, "date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_6463c13ddcf32416338ac863513" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservation_event" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reservation_id" uuid NOT NULL, "event_id" uuid NOT NULL, CONSTRAINT "PK_e727e788ddaa51681f0d495c6d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reservation_status_enum" AS ENUM('WAITING', 'DONE', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "reservation" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rid" character varying, "datetime" TIMESTAMP WITH TIME ZONE, "status" "public"."reservation_status_enum" NOT NULL DEFAULT 'WAITING', "user_memo" character varying, "admin_memo" character varying, "building" character varying, "path_visit" character varying, "detail_visit" character varying, "user_id" uuid NOT NULL, "integrated_crm_category_id" uuid NOT NULL, CONSTRAINT "PK_48b1f9922368359ab88e8bfa525" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservation_product" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reservation_id" uuid NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_8d50e21bc2ac13e92bddb624513" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "specific_slot" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "building" character varying NOT NULL, "date" TIMESTAMP WITH TIME ZONE, "hour" integer NOT NULL, "minutes" integer NOT NULL DEFAULT '0', "max_slot" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_b8f3a1028595bfb9c1bc94655f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reservation_slot_day_of_week_enum" AS ENUM('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT')`);
        await queryRunner.query(`CREATE TABLE "reservation_slot" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "building" character varying NOT NULL, "day_of_week" "public"."reservation_slot_day_of_week_enum" NOT NULL, "hour" integer NOT NULL, "minutes" integer NOT NULL DEFAULT '0', "max_slot" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_9cb6cdef23382d81831465dabb4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reservation_event" ADD CONSTRAINT "FK_b20721154df5441a5b8f0e96ef9" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_event" ADD CONSTRAINT "FK_deb5ad40aae67c5a0db2f4bd77b" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_e219b0a4ff01b85072bfadf3fd7" FOREIGN KEY ("user_id") REFERENCES "account_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_637c4c96c29293a217453f2e2d5" FOREIGN KEY ("integrated_crm_category_id") REFERENCES "integrated_crm_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_product" ADD CONSTRAINT "FK_ad4ef2b0748922faf7669657c98" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_product" ADD CONSTRAINT "FK_df79be81114097a2a408dc0475b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation_product" DROP CONSTRAINT "FK_df79be81114097a2a408dc0475b"`);
        await queryRunner.query(`ALTER TABLE "reservation_product" DROP CONSTRAINT "FK_ad4ef2b0748922faf7669657c98"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_637c4c96c29293a217453f2e2d5"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_e219b0a4ff01b85072bfadf3fd7"`);
        await queryRunner.query(`ALTER TABLE "reservation_event" DROP CONSTRAINT "FK_deb5ad40aae67c5a0db2f4bd77b"`);
        await queryRunner.query(`ALTER TABLE "reservation_event" DROP CONSTRAINT "FK_b20721154df5441a5b8f0e96ef9"`);
        await queryRunner.query(`DROP TABLE "reservation_slot"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_slot_day_of_week_enum"`);
        await queryRunner.query(`DROP TABLE "specific_slot"`);
        await queryRunner.query(`DROP TABLE "reservation_product"`);
        await queryRunner.query(`DROP TABLE "reservation"`);
        await queryRunner.query(`DROP TYPE "public"."reservation_status_enum"`);
        await queryRunner.query(`DROP TABLE "reservation_event"`);
        await queryRunner.query(`DROP TABLE "close_day"`);
    }

}
