import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * blog.posts.product_page 길이 상한 200 → 1000 확대.
 * 한 글에 상세페이지를 여러 개(파이프 구분) 연결하는 개요·가이드 글에서, 외국어(번체 등) 상세페이지명이 길어
 * 200자를 넘겨 저장 실패(무의미한 500)가 났다. 예: 대만 '첫 방문 가이드'가 상세페이지 20개 연결 → 203자.
 * varchar 길이 확대는 Postgres에서 메타데이터만 바꾸는 작업이라 테이블 재작성·잠금 없이 즉시 적용된다.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class WidenBlogProductPage1785200000000 implements MigrationInterface {
  name = "WidenBlogProductPage1785200000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ALTER COLUMN "product_page" TYPE varchar(1000)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 되돌릴 때 기존 데이터가 200자를 넘으면 실패할 수 있음 — 그 경우 수동 정리 필요.
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ALTER COLUMN "product_page" TYPE varchar(200)
    `)
  }
}
