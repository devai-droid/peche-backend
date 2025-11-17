import { Column, Entity, PrimaryColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { SystemConstantsKey } from "@root/shared/enum/system"

@Entity()
export class SystemConstants extends TimeStampEntity {
  @ApiProperty()
  @PrimaryColumn({ type: "enum", enum: SystemConstantsKey, nullable: false })
  key: SystemConstantsKey

  @ApiProperty()
  @Column({ nullable: false, default: false })
  value: boolean
}
