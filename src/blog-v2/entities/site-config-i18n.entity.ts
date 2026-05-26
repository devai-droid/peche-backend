import { Column, Entity, PrimaryColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"

/**
 * 사이트 공통 정보의 언어별 표시값 오버라이드.
 * 공통 식별값(URL·@id·schema타입·전화·좌표)은 site_config 1행 그대로 두고,
 * 표시값(병원명·주소·진료과목·진료영역·SNS·인증)만 언어별로 덮어쓴다. 없으면 site_config(기본)로 폴백.
 */
@Entity({ schema: "blog", name: "site_config_i18n" })
export class BlogSiteConfigI18n extends TimeStampEntity {
  @ApiProperty()
  @PrimaryColumn({ name: "target_site", length: 50 })
  targetSite: string

  @ApiProperty()
  @PrimaryColumn({ length: 10 })
  lang: string

  @ApiProperty({ required: false })
  @Column({ name: "hospital_name", length: 200, nullable: true })
  hospitalName?: string

  @ApiProperty({ required: false })
  @Column({ name: "address_street", length: 200, nullable: true })
  addressStreet?: string

  @ApiProperty({ required: false })
  @Column({ name: "address_locality", length: 100, nullable: true })
  addressLocality?: string

  @ApiProperty({ required: false })
  @Column({ name: "address_region", length: 100, nullable: true })
  addressRegion?: string

  @ApiProperty({ required: false })
  @Column({ name: "address_postal_code", length: 20, nullable: true })
  addressPostalCode?: string

  @ApiProperty({ required: false })
  @Column({ name: "address_country", length: 10, nullable: true })
  addressCountry?: string

  @ApiProperty({ required: false })
  @Column({ name: "medical_specialty", length: 100, nullable: true })
  medicalSpecialty?: string

  @ApiProperty({ required: false, type: [String] })
  @Column({ name: "same_as", type: "text", array: true, nullable: true })
  sameAs?: string[]

  @ApiProperty({ required: false, type: [String] })
  @Column({ name: "knows_about", type: "text", array: true, nullable: true })
  knowsAbout?: string[]

  @ApiProperty({ required: false, type: [String] })
  @Column({ name: "certifications", type: "text", array: true, nullable: true })
  certifications?: string[]
}
