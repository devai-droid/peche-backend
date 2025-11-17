import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Exclude } from "class-transformer"
import { TimeStampEntity } from "../../shared/entity/time-stamp.entity"
import { AuthProvider, LanguageLocale, Role } from "../../shared/enum/auth"
import { UserStatus } from "../../shared/enum/user"
import { ApiProperty } from "@nestjs/swagger"
import { FileObject } from "@root/file/entities/file-object.entity"

@Entity()
export class AccountUser extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  phoneNumber?: string

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  email?: string

  @Exclude()
  @Column({ nullable: true })
  password?: string

  @ApiProperty()
  @Column({ nullable: true })
  name?: string

  @Column({
    type: "enum",
    enum: AuthProvider,
    nullable: false,
    default: AuthProvider.ORIGIN,
  })
  provider: AuthProvider

  @Exclude()
  @Column({ nullable: true })
  providerSub?: string

  @Column({
    type: "enum",
    enum: LanguageLocale,
    nullable: true,
  })
  languageLocale?: LanguageLocale

  @Column({ type: "enum", enum: UserStatus, nullable: false, default: UserStatus.UNVERIFIED })
  status: UserStatus

  @ApiProperty()
  @Column({ nullable: true })
  region?: string

  @Column({ nullable: true })
  marketingAccepted?: boolean

  @Column({ type: "enum", enum: Role, array: true, default: [] })
  roles: Role[]

  @ApiProperty()
  @Column({ nullable: true })
  description?: string

  @ApiProperty()
  @ManyToOne(() => FileObject, { nullable: true, eager: true })
  @JoinColumn()
  profile?: FileObject

  @Column({ nullable: true })
  customerNumber?: string
}
