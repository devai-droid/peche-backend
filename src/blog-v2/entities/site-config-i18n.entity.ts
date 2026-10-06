import { Column, Entity, PrimaryColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"
import { SiteSocialLink } from "@root/blog-v2/entities/site-config.entity"

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

  @ApiProperty({ required: false, description: "진료시간 - 평일" })
  @Column({ name: "weekday_hours", length: 200, nullable: true })
  weekdayHours?: string

  @ApiProperty({ required: false, description: "진료시간 - 주말·공휴일" })
  @Column({ name: "weekend_hours", length: 200, nullable: true })
  weekendHours?: string

  @ApiProperty({ required: false, description: "진료시간 - 점심/안내 문구" })
  @Column({ name: "lunch_info", length: 300, nullable: true })
  lunchInfo?: string

  @ApiProperty({ required: false, description: "대표자명 (언어별 표기)" })
  @Column({ name: "representative_name", length: 100, nullable: true })
  representativeName?: string

  @ApiProperty({ required: false, description: "표시용 주소 (언어별, 줄바꿈 허용)" })
  @Column({ name: "display_address", type: "text", nullable: true })
  displayAddress?: string

  @ApiProperty({ required: false, description: "약도·교통 안내 (언어별)" })
  @Column({ name: "landmark", length: 200, nullable: true })
  landmark?: string

  @ApiProperty({ required: false, description: "푸터·헤더 SNS 링크 목록 (언어별)" })
  @Column({ name: "social_links", type: "jsonb", nullable: true })
  socialLinks?: SiteSocialLink[]

  @ApiProperty({ required: false, description: "대표 상담 채널 플랫폼 (언어별)" })
  @Column({ name: "primary_consult_platform", length: 40, nullable: true })
  primaryConsultPlatform?: string

  @ApiProperty({ required: false, description: "대표 상담 채널 링크 (언어별)" })
  @Column({ name: "primary_consult_url", type: "text", nullable: true })
  primaryConsultUrl?: string
}
