import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { CreatedOnlyTimeStampEntity } from "@root/shared/entity/created-only-time-stamp.entity"

@Entity()
export class AuthCode extends CreatedOnlyTimeStampEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: false })
  code: string

  @Column({ nullable: true })
  phoneNumber: string

  @Column({ nullable: true })
  email: string

  @Column({ nullable: false })
  ip: string
}
