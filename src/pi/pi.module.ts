import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BlogSiteConfig } from "@root/blog-v2/entities/site-config.entity"
import { BlogSiteConfigI18n } from "@root/blog-v2/entities/site-config-i18n.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { PiClientService } from "./pi-client.service"
import { PiSyncService } from "./pi-sync.service"
import { PiCatalogSubscriber } from "./pi-catalog.subscriber"
import { PiController } from "./pi.controller"

/**
 * PI(챗봇) facts 연동 모듈. 사이트 기본정보·의료진·예약 안내 문구·시술/이벤트 카탈로그를 PI로 PUSH 동기화.
 * 다른 모듈의 **엔티티만** 읽으므로 그 서비스에 의존하지 않음(순환 의존 없음).
 * 상품·이벤트 엔티티는 **클래스를 import 하지 않고 이름으로**(`DataSource.getRepository("Product")`) 쓴다 — 이 모듈은 app.module에서
 * 일찍 로드되는데, 여기서 Event·EventBundle 같은 서로 참조하는 엔티티 클래스를 먼저 import 하면 데코레이터 평가 순서가 바뀌어
 * Swagger가 「circular dependency (property key: bundle)」로 부팅에 실패했다(2026-10-16 로컬 실측).
 * 카탈로그 저장 트리거는 엔티티 구독자(PiCatalogSubscriber) — 상품·분류·상세페이지·이벤트·번들의 모든 저장 경로를 한 자리에서 잡는다.
 */
@Module({
  imports: [TypeOrmModule.forFeature([BlogSiteConfig, BlogSiteConfigI18n, BlogDoctor])],
  controllers: [PiController],
  providers: [PiClientService, PiSyncService, PiCatalogSubscriber],
  exports: [PiSyncService],
})
export class PiModule {}
