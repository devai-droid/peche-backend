import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { CreatedOnlyTimeStampEntity } from "../../shared/entity/created-only-time-stamp.entity"

export enum VerificationType {
  CONFIRM = "CONFIRM",
  PASSWORD = "PASSWORD",
}

@Entity()
export class VerificationCode extends CreatedOnlyTimeStampEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: false })
  email: string

  @Column({ nullable: false })
  code: string

  @Column({
    type: "enum",
    enum: VerificationType,
    nullable: false,
    default: VerificationType.CONFIRM,
  })
  verificationType: VerificationType
}
