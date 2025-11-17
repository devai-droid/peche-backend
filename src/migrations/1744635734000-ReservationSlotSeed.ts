import { MigrationInterface, QueryRunner } from "typeorm";
import { Building } from "@root/shared/enum/category";
import { DaysOfWeek } from "@root/shared/enum/reservation";

export class ReservationSlotSeed1744635734000 implements MigrationInterface {
    name = 'ReservationSlotSeed1744635734000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // BUILDING_3 예약 슬롯 데이터 추가
        const slots = [
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 10,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 10,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 11,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 11,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 12,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 12,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 13,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 13,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 14,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 14,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 15,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 15,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 16,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 16,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 17,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 17,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 18,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 18,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 19,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 19,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 20,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.MON,
                hour: 20,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 10,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 10,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 11,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 11,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 12,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 12,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 13,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 13,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 14,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 14,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 15,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 15,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 16,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 16,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 17,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 17,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 18,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 18,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 19,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 19,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 20,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.TUE,
                hour: 20,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 10,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 10,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 11,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 11,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 12,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 12,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 13,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 13,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 14,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 14,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 15,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 15,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 16,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 16,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 17,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 17,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 18,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 18,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 19,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 19,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 20,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.WED,
                hour: 20,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 10,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 10,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 11,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 11,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 12,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 12,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 13,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 13,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 14,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 14,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 15,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 15,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 16,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 16,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 17,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 17,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 18,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 18,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 19,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 19,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 20,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.THU,
                hour: 20,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 10,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 10,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 11,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 11,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 12,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 12,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 13,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 13,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 14,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 14,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 15,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 15,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 16,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 16,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 17,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 17,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 18,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 18,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 19,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 19,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 20,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.FRI,
                hour: 20,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 10,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 10,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 11,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 11,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 12,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 12,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 13,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 13,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 14,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 14,
                minutes: 30,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 15,
                minutes: 0,
                maxSlot: 8
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 15,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 16,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 16,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 17,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 17,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 18,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 18,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 19,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 19,
                minutes: 30,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 20,
                minutes: 0,
                maxSlot: 0
            },
            {
                building: Building.BUILDING_3,
                dayOfWeek: DaysOfWeek.SAT,
                hour: 20,
                minutes: 30,
                maxSlot: 0
            }
        ];

        // 각 슬롯 데이터를 삽입
        for (const slot of slots) {
            await queryRunner.query(`
                INSERT INTO "reservation_slot"
                ("building", "day_of_week", "hour", "minutes", "max_slot", "created_at", "updated_at")
                VALUES
                ('${slot.building}', '${slot.dayOfWeek}', ${slot.hour}, ${slot.minutes}, ${slot.maxSlot}, NOW(), NOW())
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // BUILDING_3 예약 슬롯 데이터 삭제
        await queryRunner.query(`DELETE FROM "reservation_slot" WHERE "building" = '${Building.BUILDING_3}'`);
    }
}
