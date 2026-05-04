import { MigrationInterface, QueryRunner } from "typeorm"

const PACKAGE_USE_PRODUCT_ID = "5e8c9d2f-1a3b-4c5d-8e6f-7a9b0c1d2e3f"

export class AddPackageUseProduct1776200000000 implements MigrationInterface {
  name = "AddPackageUseProduct1776200000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "product" (id, name, price) VALUES ($1, '보유권 사용', 0) ON CONFLICT (id) DO NOTHING`,
      [PACKAGE_USE_PRODUCT_ID],
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "product" WHERE id = $1`, [PACKAGE_USE_PRODUCT_ID])
  }
}
