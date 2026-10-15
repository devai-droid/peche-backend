import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BlogSiteConfig } from "@root/blog-v2/entities/site-config.entity"
import { BlogSiteConfigI18n } from "@root/blog-v2/entities/site-config-i18n.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { Product } from "@root/product/entities/product.entity"
import { ProductCategory } from "@root/product/entities/product-category.entity"
import { EventBundle } from "@root/event/entities/event-bundle.entity"
import { PiClientService } from "./pi-client.service"
import { PiSyncService } from "./pi-sync.service"
import { PiCatalogSubscriber } from "./pi-catalog.subscriber"
import { PiController } from "./pi.controller"

/**
 * PI(챗봇) facts 연동 모듈. 사이트 기본정보·의료진·예약 안내 문구·시술/이벤트 카탈로그를 PI로 PUSH 동기화.
 * 다른 모듈의 **엔티티만** repo로 읽으므로 그 서비스에 의존하지 않음(순환 의존 없음).
 * 카탈로그 저장 트리거는 엔티티 구독자(PiCatalogSubscriber) — 상품·분류·상세페이지·이벤트·번들의 모든 저장 경로를 한 자리에서 잡는다.
 */
@Module({
  imports: [TypeOrmModule.forFeature([BlogSiteConfig, BlogSiteConfigI18n, BlogDoctor, Product, ProductCategory, EventBundle])],
  controllers: [PiController],
  providers: [PiClientService, PiSyncService, PiCatalogSubscriber],
  exports: [PiSyncService],
})
export class PiModule {}
