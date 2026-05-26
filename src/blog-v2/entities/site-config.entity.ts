import { Column, Entity, PrimaryColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"

/**
 * 사이트(병원) 공통 정보 1행. 모든 블로그 글의 병원 구조화데이터(MedicalClinic @id)·메타가 이 1행을 공통 참조.
 * 어드민 '기본 정보 관리'에서 수정 → 전 글 자동 반영. (CTA·지원언어·전체시술경로는 코드 상수 유지)
 */
@Entity({ schema: "blog", name: "site_config" })
export class BlogSiteConfig extends TimeStampEntity {
  @ApiProperty()
  @PrimaryColumn({ name: "target_site", length: 50 })
  targetSite: string

  @ApiProperty()
  @Column({ name: "hospital_name", length: 200, default: "" })
  hospitalName: string

  @ApiProperty()
  @Column({ name: "base_url", length: 300, default: "" })
  baseUrl: string

  @ApiProperty({ description: "schema.org @type (MedicalClinic 등)" })
  @Column({ name: "organization_type", length: 50, default: "MedicalClinic" })
  organizationType: string

  @ApiProperty({ required: false })
  @Column({ length: 50, nullable: true })
  telephone?: string

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

  @ApiProperty({ required: false, description: "국가 코드 (KR 등)" })
  @Column({ name: "address_country", length: 10, nullable: true })
  addressCountry?: string

  @ApiProperty({ required: false, description: "위도 (지역 검색 geo)" })
  @Column({ type: "double precision", nullable: true })
  latitude?: number

  @ApiProperty({ required: false, description: "경도 (지역 검색 geo)" })
  @Column({ type: "double precision", nullable: true })
  longitude?: number

  @ApiProperty({ required: false, description: "표방 진료과목 (medicalSpecialty)" })
  @Column({ name: "medical_specialty", length: 100, nullable: true })
  medicalSpecialty?: string

  @ApiProperty({ required: false, type: [String], description: "공식 SNS (sameAs)" })
  @Column({ name: "same_as", type: "text", array: true, nullable: true })
  sameAs?: string[]

  @ApiProperty({ required: false, type: [String], description: "진료/시술 영역 (knowsAbout)" })
  @Column({ name: "knows_about", type: "text", array: true, nullable: true })
  knowsAbout?: string[]

  @ApiProperty({ required: false, type: [String], description: "병원 인증·자격 (hasCredential)" })
  @Column({ name: "certifications", type: "text", array: true, nullable: true })
  certifications?: string[]
}
