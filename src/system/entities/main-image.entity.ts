import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { MainImageStatus } from "@root/shared/enum/system"
import { FileObject } from "@root/file/entities/file-object.entity"

@Entity()
export class MainImage extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: MainImageStatus, nullable: false, default: MainImageStatus.INACTIVE })
  status: MainImageStatus

  @ApiProperty()
  @Column({ nullable: true })
  description?: string

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  image?: FileObject

  @ApiProperty()
  @Column({ nullable: true })
  order?: number
}
