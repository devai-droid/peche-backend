import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { FileObject } from "@root/file/entities/file-object.entity"
import { MainPopupStatus } from "@root/shared/enum/system"

/** 휴무·안내 팝업의 가운데 항목 1건 (날짜 등 제목 + 시간/휴무 설명). */
export interface PopupNoticeItem {
  title: string
  subtitle: string
}

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

  @ApiProperty({
    required: false,
    description: "휴무·안내 팝업 항목(있으면 이미지 대신 'Information' 안내 팝업으로 표시)",
  })
  @Column({ name: "notice_items", type: "jsonb", nullable: true })
  noticeItems?: PopupNoticeItem[]

  @ApiProperty()
  @Column({ nullable: true })
  order?: number

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  startDate?: Date | null

  @ApiProperty()
  @Column({ type: "timestamptz", nullable: true })
  endDate?: Date | null
}
