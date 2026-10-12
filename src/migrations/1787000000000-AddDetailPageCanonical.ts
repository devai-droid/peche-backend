import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * product_detail_page.canonical_detail_page_id — 중복 콘텐츠(같은 원고를 여러 상품에 노출) 통합용.
 * 값이 있으면 이 상세페이지는 "사본"이고, 그 값이 가리키는 상세페이지가 "대표(canonical)".
 * 사본의 검색엔진 canonical은 대표 상품 주소를 가리키고, 블로그 목록 등에는 대표만 노출된다.
 * 비어 있으면 원본(대표 또는 단독).
 *
 * 운영 public.* 데이터 무손 — 컬럼 추가만. 자기참조라 FK는 걸지 않고 애플리케이션에서 관리.
 */
export class AddDetailPageCanonical1787000000000 implements MigrationInterface {
  name = "AddDetailPageCanonical1787000000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "public"."product_detail_page" ADD COLUMN IF NOT EXISTS "canonical_detail_page_id" uuid
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."product_detail_page" DROP COLUMN IF EXISTS "canonical_detail_page_id"`,
    )
  }
}
