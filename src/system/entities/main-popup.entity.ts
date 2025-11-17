import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { FileObject } from "@root/file/entities/file-object.entity"
import { MainPopupStatus } from "@root/shared/enum/system"

@Entity()
export class MainPopup extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: MainPopupStatus, nullable: false, default: MainPopupStatus.INACTIVE })
  status: MainPopupStatus

  @ApiProperty()
  @Column({ nullable: true })
  description?: string

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  image?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageEN?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageZH?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageZHTW?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageJA?: FileObject

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  imageTH?: FileObject

  @ApiProperty()
  @Column({ nullable: true })
  order?: number
}
