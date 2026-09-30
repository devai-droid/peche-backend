import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 푸터·헤더 SNS 링크(social_links)를 현재 웹 하드코딩 값으로 언어별 시드.
 * ko는 site_config(기본), 나머지는 site_config_i18n. 이미 값이 있으면 덮지 않음(IS NULL일 때만).
 * 프론트가 이 값으로 아이콘을 그리며, 비어 있으면 기존 하드코딩으로 폴백한다.
 *
 * 운영 public.* 무손. blog schema 격리 유지.
 */
export class SeedSiteSocialLinks1785400000000 implements MigrationInterface {
  name = "SeedSiteSocialLinks1785400000000"

  private readonly links: Record<string, unknown[]> = {
    ko: [
      { platform: "naverPlace", url: "https://naver.me/FLe0V59M", enabled: true, order: 0 },
      { platform: "naverBlog", url: "https://blog.naver.com/pecheclinic", enabled: true, order: 1 },
      { platform: "kakao", url: "http://pf.kakao.com/_dxoiLn", enabled: true, order: 2 },
      { platform: "instagram", url: "https://www.instagram.com/peche_clinic/", enabled: true, order: 3 },
    ],
    en: [
      { platform: "whatsapp", url: "https://wa.me/message/4Y5JC2HX6OH5H1", enabled: true, order: 0 },
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic.en/", enabled: true, order: 1 },
      { platform: "tiktok", url: "https://www.tiktok.com/@pecheclinic_eng", enabled: true, order: 2 },
    ],
    zh: [
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic.cn/", enabled: true, order: 0 },
      { platform: "wechat", enabled: true, order: 1 },
    ],
    "zh-TW": [
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic_tw/", enabled: true, order: 0 },
      { platform: "facebook", url: "https://www.facebook.com/profile.php?id=61582363886175", enabled: true, order: 1 },
      { platform: "line", url: "https://line.me/R/ti/p/@683jgqmd", enabled: true, order: 2 },
    ],
    ja: [
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic.jp/", enabled: true, order: 0 },
      { platform: "line", url: "https://line.me/R/ti/p/@235wfyao", enabled: true, order: 1 },
      { platform: "tiktok", url: "https://www.tiktok.com/@pecheclinic_jp?is_from_webapp=1&sender_device=pc", enabled: true, order: 2 },
      { platform: "x", url: "https://x.com/pecheclinic_jp", enabled: true, order: 3 },
    ],
    th: [
      { platform: "instagram", url: "https://www.instagram.com/pecheclinic_th/", enabled: true, order: 0 },
      { platform: "facebook", url: "https://www.facebook.com/profile.php?id=61582230961269", enabled: true, order: 1 },
      { platform: "line", url: "https://line.me/R/ti/p/@892druai", enabled: true, order: 2 },
      { platform: "tiktok", url: "https://www.tiktok.com/@pecheclinic_th", enabled: true, order: 3 },
    ],
  }

  // 구글 플레이스는 언어 공통(같은 링크). 푸터·헤더 아이콘은 아니고 '오시는 길' 버튼에서 사용.
  private withGoogle(arr: unknown[]): unknown[] {
    return [
      ...arr,
      {
        platform: "googlePlace",
        url: "https://maps.app.goo.gl/bkkdJBLVdT7UkKtg9",
        enabled: true,
        order: 10,
      },
    ]
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ko → 기본 행 (비어 있을 때만)
    await queryRunner.query(
      `UPDATE "blog"."site_config" SET "social_links" = $1::jsonb
       WHERE "target_site" = 'peche' AND "social_links" IS NULL`,
      [JSON.stringify(this.withGoogle(this.links.ko))],
    )

    // 나머지 언어 → i18n 행 (없으면 생성, 있으면 social_links가 비어 있을 때만 채움)
    for (const lang of ["en", "zh", "zh-TW", "ja", "th"]) {
      await queryRunner.query(
        `INSERT INTO "blog"."site_config_i18n" ("target_site","lang","social_links")
         VALUES ('peche', $1, $2::jsonb)
         ON CONFLICT ("target_site","lang")
         DO UPDATE SET "social_links" = EXCLUDED."social_links"
         WHERE "site_config_i18n"."social_links" IS NULL`,
        [lang, JSON.stringify(this.withGoogle(this.links[lang]))],
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "blog"."site_config" SET "social_links" = NULL WHERE "target_site" = 'peche'`,
    )
    await queryRunner.query(
      `UPDATE "blog"."site_config_i18n" SET "social_links" = NULL WHERE "target_site" = 'peche'`,
    )
  }
}
