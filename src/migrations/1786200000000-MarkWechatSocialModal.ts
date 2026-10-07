import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 기존 위챗(wechat) SNS 항목에 isModal=true를 표시한다.
 * 위챗은 링크가 아니라 QR 이미지 팝업으로 뜨는데, 그동안 프론트가 platform='wechat'로 특수처리했다.
 * 이제 isModal 플래그를 데이터에 둬서 사이트·챗봇이 동일한 데이터로 팝업을 띄울 수 있게 한다.
 * (팝업 이미지 modalImageUrl은 어드민에서 업로드. 비어 있으면 프론트가 기존 내장 QR로 폴백.)
 */
export class MarkWechatSocialModal1786200000000 implements MigrationInterface {
  name = "MarkWechatSocialModal1786200000000"

  private readonly setModalSql = (table: string, extraWhere = "") =>
    `UPDATE ${table}
       SET "social_links" = (
         SELECT jsonb_agg(
           CASE WHEN elem->>'platform' = 'wechat'
             THEN elem || '{"isModal": true}'::jsonb
             ELSE elem END
         )
         FROM jsonb_array_elements("social_links") elem
       )
     WHERE "target_site" = 'peche'
       AND "social_links" @> '[{"platform":"wechat"}]'::jsonb ${extraWhere}`

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(this.setModalSql(`"blog"."site_config"`))
    await queryRunner.query(this.setModalSql(`"blog"."site_config_i18n"`))
  }

  public async down(): Promise<void> {
    // 플래그 추가만 했으므로 롤백 불필요(데이터 보존).
  }
}
