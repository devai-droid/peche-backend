import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 1) 위치/지도 공통 링크에 카카오맵(kakao_place_url) 컬럼 추가. (링크는 어드민에서 직접 입력)
 * 2) 대표 상담 채널을 별도 필드가 아니라 '언어별 SNS 항목의 isPrimary'로 통합한다.
 *    각 언어의 대표 채널(ko=kakao, en=whatsapp, zh=wechat, ja/zh-TW/th=line)에 isPrimary=true 부여.
 *    → 대표 채널도 헤더·푸터 SNS로 노출되고, 상담버튼·모바일탭바는 이 isPrimary 항목으로 연결된다.
 * 모두 blog 스키마, 추가·수정만.
 */
export class AddKakaoPlaceAndPrimarySocial1786000000000 implements MigrationInterface {
  name = "AddKakaoPlaceAndPrimarySocial1786000000000"

  // 정리된 언어별 SNS(대표 isPrimary 포함). 플레이스·목록밖·쓰레드 제외.
  private readonly links: Record<
    string,
    { platform: string; url?: string; enabled: boolean; order: number; isPrimary?: boolean }[]
  > = {
    ko: [
      { platform: "kakao", url: "http://pf.kakao.com/_dxoiLn", enabled: true, order: 0, isPrimary: true },
      { platform: "instagram", url: "https://www.instagram.com/peche_clinic/", enabled: true, order: 1 },
      { platform: "naverBlog", url: "https://blog.naver.com/pecheclinic", enabled: true, order: 2 },
    ],
    en: [
      { platform: "whatsapp", url: "https://wa.me/message/4Y5JC2HX6OH5H1", enabled: true, order: 0, isPrimary: true },
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic.en/", enabled: true, order: 1 },
    ],
    zh: [{ platform: "wechat", enabled: true, order: 0, isPrimary: true }],
    ja: [
      { platform: "line", url: "https://line.me/R/ti/p/@235wfyao", enabled: true, order: 0, isPrimary: true },
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic.jp/", enabled: true, order: 1 },
    ],
    th: [
      { platform: "line", url: "https://line.me/R/ti/p/@892druai", enabled: true, order: 0, isPrimary: true },
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic_th/", enabled: true, order: 1 },
    ],
    "zh-TW": [
      { platform: "line", url: "https://line.me/R/ti/p/@683jgqmd", enabled: true, order: 0, isPrimary: true },
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic_tw/", enabled: true, order: 1 },
    ],
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config" ADD COLUMN IF NOT EXISTS "kakao_place_url" text`,
    )

    // 대표(isPrimary) 반영 — ko는 기본 행
    await queryRunner.query(
      `UPDATE "blog"."site_config" SET "social_links" = $1::jsonb WHERE "target_site" = 'peche'`,
      [JSON.stringify(this.links.ko)],
    )
    for (const lang of ["en", "zh", "zh-TW", "ja", "th"]) {
      await queryRunner.query(
        `INSERT INTO "blog"."site_config_i18n" ("target_site","lang","social_links")
         VALUES ('peche', $1, $2::jsonb)
         ON CONFLICT ("target_site","lang")
         DO UPDATE SET "social_links" = EXCLUDED."social_links"`,
        [lang, JSON.stringify(this.links[lang])],
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog"."site_config" DROP COLUMN IF EXISTS "kakao_place_url"`)
  }
}
