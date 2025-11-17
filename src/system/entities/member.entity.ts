import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { MemberOccupation, MemberStatus } from "@root/shared/enum/system"
import { FileObject } from "@root/file/entities/file-object.entity"

@Entity()
export class Member extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: MemberStatus, nullable: false, default: MemberStatus.INACTIVE })
  status: MemberStatus

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
  description?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionEN?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionZH?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionZHTW?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionJA?: string

  @ApiProperty()
  @Column({ nullable: true })
  descriptionTH?: string

  @ApiProperty()
  @Column({ type: "enum", enum: MemberOccupation, nullable: false })
  occupation: MemberOccupation

  @ApiProperty()
  @Column({ nullable: true })
  birthDate?: string

  @ApiProperty()
  @Column({ nullable: true })
  phoneNumber?: string

  @ApiProperty()
  @Column({ nullable: true })
  joinDate?: string

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  image?: FileObject

  @ApiProperty()
  @Column({ nullable: true })
  order?: number
}
