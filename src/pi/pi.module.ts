import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BlogSiteConfig } from "@root/blog-v2/entities/site-config.entity"
import { BlogDoctor } from "@root/blog-v2/entities/doctor.entity"
import { PiClientService } from "./pi-client.service"
import { PiSyncService } from "./pi-sync.service"
import { PiController } from "./pi.controller"

/**
 * PI(챗봇) facts 연동 모듈. 사이트 기본정보·의료진을 PI로 PUSH 동기화.
 * blog-v2의 엔티티만 repo로 읽으므로 blog-v2 서비스에 의존하지 않음(순환 의존 없음).
 */
@Module({
  imports: [TypeOrmModule.forFeature([BlogSiteConfig, BlogDoctor])],
  controllers: [PiController],
  providers: [PiClientService, PiSyncService],
  exports: [PiSyncService],
})
export class PiModule {}
