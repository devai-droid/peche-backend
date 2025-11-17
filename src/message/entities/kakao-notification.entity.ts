import { Column, Entity, PrimaryColumn } from "typeorm"
import { CreatedOnlyTimeStampEntity } from "@root/shared/entity/created-only-time-stamp.entity"
import { BizMsgMessage } from "@root/message/dto/kakao-notification.model"

@Entity()
export class KakaoNotification extends CreatedOnlyTimeStampEntity {
  @PrimaryColumn({ type: "uuid" })
  id: string

  @Column("simple-json", { nullable: false })
  message: BizMsgMessage
}
