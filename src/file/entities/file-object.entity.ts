import { Exclude, Expose } from "class-transformer"
import { Column, Entity, PrimaryColumn } from "typeorm"
import { STATIC_CONFIG } from "../../shared/constant/static-config"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { HiddenTimeStampEntity } from "@root/shared/entity/time-stamp.entity"

@Entity()
export class FileObject extends HiddenTimeStampEntity {
  @ApiProperty()
  @PrimaryColumn({ type: "uuid" })
  id: string

  @Exclude()
  @Column()
  directory: string

  @Exclude()
  @Column()
  bucketName: string

  @Exclude()
  @Column({ nullable: true })
  userId?: string

  @ApiPropertyOptional({ type: "string" })
  @Expose({ name: "url" })
  get url() {
    return this.directory && STATIC_CONFIG.MEDIA_BASE_URL ? this.cloudfrontBaseUrl : undefined
  }

  @Exclude()
  get cloudfrontBaseUrl() {
    return `${STATIC_CONFIG.MEDIA_BASE_URL}/${this.directory}/${this.id}`
  }
}
