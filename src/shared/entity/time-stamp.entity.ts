import { BaseEntity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { Exclude } from "class-transformer"

export class TimeStampEntity extends BaseEntity {
  @ApiProperty()
  @CreateDateColumn({ type: "timestamptz", update: false })
  createdAt: string

  @ApiProperty()
  @UpdateDateColumn({ type: "timestamptz", update: true })
  updatedAt: string

  @ApiProperty()
  @Exclude()
  @Column({ nullable: true })
  createdBy?: string

  @ApiProperty()
  @Exclude()
  @Column({ nullable: true })
  updatedBy?: string
}

export class HiddenTimeStampEntity extends BaseEntity {
  @Exclude()
  @CreateDateColumn({ update: false })
  createdAt: string

  @Exclude()
  @UpdateDateColumn({ update: true })
  updatedAt: string

  @Exclude()
  @Column({ nullable: true })
  createdBy?: string

  @Exclude()
  @Column({ nullable: true })
  updatedBy?: string
}
