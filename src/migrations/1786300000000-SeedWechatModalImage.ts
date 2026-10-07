import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 기존 위챗(wechat) SNS 항목의 modalImageUrl을 현재 쓰던 QR 이미지로 채운다(비어 있을 때만).
 * QR 이미지는 미디어 저장소(CloudFront)에 올려둔 공개 URL. 이걸 데이터에 넣어야 사이트·챗봇이 같은 QR을 띄운다.
 */
export class SeedWechatModalImage1786300000000 implements MigrationInterface {
  name = "SeedWechatModalImage1786300000000"

  private readonly qrUrl = "https://d1snu9ea4bf6mq.cloudfront.net/site-config/wechat-qr.png"

  private readonly sql = (table: string) =>
    `UPDATE ${table}
       SET "social_links" = (
         SELECT jsonb_agg(
           CASE
             WHEN elem->>'platform' = 'wechat' AND (elem->>'modalImageUrl') IS NULL
               THEN elem || jsonb_build_object('modalImageUrl', '${this.qrUrl}', 'isModal', true)
             ELSE elem
           END
         )
         FROM jsonb_array_elements("social_links") elem
       )
     WHERE "target_site" = 'peche'
       AND "social_links" @> '[{"platform":"wechat"}]'::jsonb`

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(this.sql(`"blog"."site_config"`))
    await queryRunner.query(this.sql(`"blog"."site_config_i18n"`))
  }

  public async down(): Promise<void> {
    // 값 채움만 했으므로 롤백 불필요.
  }
}
