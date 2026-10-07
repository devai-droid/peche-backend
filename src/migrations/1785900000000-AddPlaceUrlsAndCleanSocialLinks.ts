import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 1) 위치/지도 전용 공통 링크 컬럼(google_place_url·naver_place_url)을 blog.site_config에 추가하고,
 *    현재 쓰던 공통 플레이스 주소로 시드한다. (SNS가 아니라 '위치/지도 버튼'용으로 분리)
 * 2) 언어별 SNS(social_links)를 지정 목록대로 정리한다.
 *    - 플레이스(googlePlace/naverPlace)는 SNS에서 제거(위 전용 컬럼으로 이동)
 *    - 목록 밖(facebook/tiktok/x) 제거, 중국(zh) 인스타그램 제거
 *    - 쓰레드(threads)는 자리만 — 여기서 시드하지 않고 어드민에서 직접 연결
 * ko는 site_config(기본), 나머지는 site_config_i18n. 모두 blog 스키마, 추가·수정만(비파괴 스키마).
 */
export class AddPlaceUrlsAndCleanSocialLinks1785900000000 implements MigrationInterface {
  name = "AddPlaceUrlsAndCleanSocialLinks1785900000000"

  // 정리된 언어별 SNS 목록(플레이스·목록밖 제외, 쓰레드 제외)
  private readonly links: Record<string, { platform: string; url?: string; enabled: boolean; order: number }[]> = {
    ko: [
      { platform: "kakao", url: "http://pf.kakao.com/_dxoiLn", enabled: true, order: 0 },
      { platform: "instagram", url: "https://www.instagram.com/peche_clinic/", enabled: true, order: 1 },
      { platform: "naverBlog", url: "https://blog.naver.com/pecheclinic", enabled: true, order: 2 },
    ],
    en: [
      { platform: "whatsapp", url: "https://wa.me/message/4Y5JC2HX6OH5H1", enabled: true, order: 0 },
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic.en/", enabled: true, order: 1 },
    ],
    zh: [{ platform: "wechat", enabled: true, order: 0 }],
    ja: [
      { platform: "line", url: "https://line.me/R/ti/p/@235wfyao", enabled: true, order: 0 },
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic.jp/", enabled: true, order: 1 },
    ],
    th: [
      { platform: "line", url: "https://line.me/R/ti/p/@892druai", enabled: true, order: 0 },
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic_th/", enabled: true, order: 1 },
    ],
    "zh-TW": [
      { platform: "line", url: "https://line.me/R/ti/p/@683jgqmd", enabled: true, order: 0 },
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic_tw/", enabled: true, order: 1 },
    ],
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) 위치/지도 공통 링크 컬럼 추가
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config" ADD COLUMN IF NOT EXISTS "google_place_url" text`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog"."site_config" ADD COLUMN IF NOT EXISTS "naver_place_url" text`,
    )
    // 현재 공통 플레이스 주소로 시드(비어 있을 때만)
    await queryRunner.query(
      `UPDATE "blog"."site_config"
         SET "google_place_url" = 'https://maps.app.goo.gl/bkkdJBLVdT7UkKtg9'
       WHERE "target_site" = 'peche' AND ("google_place_url" IS NULL OR "google_place_url" = '')`,
    )
    await queryRunner.query(
      `UPDATE "blog"."site_config"
         SET "naver_place_url" = 'https://naver.me/FLe0V59M'
       WHERE "target_site" = 'peche' AND ("naver_place_url" IS NULL OR "naver_place_url" = '')`,
    )

    // 2) 언어별 SNS 정리 — ko는 기본 행
    await queryRunner.query(
      `UPDATE "blog"."site_config" SET "social_links" = $1::jsonb WHERE "target_site" = 'peche'`,
      [JSON.stringify(this.links.ko)],
    )
    // 나머지 언어는 i18n 행(있을 때만 갱신; 없으면 생성)
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
    await queryRunner.query(`ALTER TABLE "blog"."site_config" DROP COLUMN IF EXISTS "google_place_url"`)
    await queryRunner.query(`ALTER TABLE "blog"."site_config" DROP COLUMN IF EXISTS "naver_place_url"`)
    // social_links 데이터는 되돌리지 않음(이전 값 보존 불가)
  }
}
