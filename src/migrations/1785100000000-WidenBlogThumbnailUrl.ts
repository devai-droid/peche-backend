import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * blog.posts.thumbnail_url 길이 상한 500 → 1000 확대.
 * 일본어·중국어처럼 파일명이 긴 외국어 썸네일은 S3 주소가 500자를 넘겨 저장 실패(무의미한 500)가 났다.
 * varchar 길이 확대는 Postgres에서 메타데이터만 바꾸는 작업이라 테이블 재작성·잠금 없이 즉시 적용된다.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class WidenBlogThumbnailUrl1785100000000 implements MigrationInterface {
  name = "WidenBlogThumbnailUrl1785100000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ALTER COLUMN "thumbnail_url" TYPE varchar(1000)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 되돌릴 때 기존 데이터가 500자를 넘으면 실패할 수 있음 — 그 경우 수동 정리 필요.
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ALTER COLUMN "thumbnail_url" TYPE varchar(500)
    `)
  }
}
