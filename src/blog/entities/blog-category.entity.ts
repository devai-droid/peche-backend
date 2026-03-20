import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

@Entity()
export class BlogCategory extends TimeStampEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ApiProperty()
  @Column()
  name: string

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
  @Column({ default: 0 })
  sortOrder: number

  @ApiPropertyOptional()
  @Column({ nullable: true })
  eventCategoryId?: string
}
