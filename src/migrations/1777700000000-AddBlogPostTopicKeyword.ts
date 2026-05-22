import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * blog.posts 에 topic_keyword(주제 키워드 원본) 컬럼 추가.
 * CTA 버튼명·"관련글 더보기" 헤딩에 쓰이는 frontmatter topic_keyword를
 * 마스터(blog.keywords) 등록 여부와 무관하게 그대로 저장.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class AddBlogPostTopicKeyword1777700000000 implements MigrationInterface {
  name = "AddBlogPostTopicKeyword1777700000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" ADD COLUMN IF NOT EXISTS "topic_keyword" VARCHAR(100)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blog"."posts" DROP COLUMN IF EXISTS "topic_keyword"
    `)
  }
}
