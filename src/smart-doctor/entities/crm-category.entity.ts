import { Column, Entity, PrimaryColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"

@Entity()
export class CrmCategory extends TimeStampEntity {
  @ApiProperty()
  @PrimaryColumn()
  code: string

  @ApiProperty()
  @Column({ nullable: false })
  name: string

  @ApiProperty()
  @Column({ nullable: true })
  subjectCode?: string

  @ApiProperty()
  @Column({ nullable: true })
  subjectName?: string

  @ApiProperty()
  @Column({ nullable: true })
  maxSlot?: number
}
