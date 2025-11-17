import { BaseEntity, Column, CreateDateColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Exclude } from "class-transformer"

export class CreatedOnlyTimeStampEntity extends BaseEntity {
  @ApiProperty()
  @CreateDateColumn({ type: "timestamptz", update: false })
  createdAt: string

  @ApiProperty()
  @Exclude()
  @Column({ nullable: true })
  createdBy?: string
}
