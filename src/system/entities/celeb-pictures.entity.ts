import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { CelebMainPageStatus } from "@root/shared/enum/system"
import { FileObject } from "@root/file/entities/file-object.entity"

@Entity()
export class CelebPictures extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: CelebMainPageStatus, nullable: false, default: CelebMainPageStatus.INACTIVE })
  status: CelebMainPageStatus

  @ApiProperty()
  @Column({ nullable: true })
  name?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  nameTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  occupation?: string

  @ApiProperty()
  @Column({ nullable: true })
  occupationEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  occupationZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  occupationZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  occupationJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  occupationTH?: string

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
  mainPageOrder?: number

  @ApiProperty()
  @Column({ nullable: true })
  archivePageOrder?: number
}
