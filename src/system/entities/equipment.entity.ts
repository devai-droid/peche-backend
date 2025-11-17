import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { FileObject } from "@root/file/entities/file-object.entity"
import { EquipmentStatus } from "@root/shared/enum/system"

@Entity()
export class Equipment extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: EquipmentStatus, nullable: false, default: EquipmentStatus.INACTIVE })
  status: EquipmentStatus

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
  descriptionFirst?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionFirstEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionFirstZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionFirstZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionFirstJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionFirstTH?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionSecond?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionSecondEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionSecondZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionSecondZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionSecondJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionSecondTH?: string

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  image?: FileObject

  @ApiProperty()
  @Column({ nullable: true })
  order?: number
}
