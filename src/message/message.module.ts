import { Module } from "@nestjs/common"
import { SmsService } from "@root/message/service/sms.service"
import { SesService } from "@root/message/service/ses.service"
import { KakaoNotificationService } from "@root/message/service/kakao-notification.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { KakaoNotification } from "@root/message/entities/kakao-notification.entity"

@Module({
  imports: [TypeOrmModule.forFeature([KakaoNotification])],
  providers: [SmsService, SesService, KakaoNotificationService],
  exports: [SmsService, SesService, KakaoNotificationService],
})
export class MessageModule {}
