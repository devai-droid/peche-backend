import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty } from "@nestjs/swagger"
import { LanguageLocale } from "@root/shared/enum/auth"

@Entity()
export class SearchKeyword extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column({ type: "enum", enum: LanguageLocale, nullable: false, default: LanguageLocale.ko })
  languageLocale: LanguageLocale

  @ApiProperty()
  @Column({ nullable: false })
  keyword: string

  @ApiProperty()
  @Column({ nullable: true })
  order?: number
}
