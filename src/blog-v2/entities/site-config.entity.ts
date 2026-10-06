import { Column, Entity, PrimaryColumn } from "typeorm"
import { ApiProperty } from "@nestjs/swagger"
import { TimeStampEntity } from "@root/shared/entity/time-stamp.entity"

/**
 * 푸터·헤더에 노출되는 SNS/외부링크 1건.
 * platform: kakao(카카오 상담)·naverPlace·googlePlace·instagram·naverBlog·whatsapp·line·wechat·facebook·tiktok·x 등
 * url: 링크 주소. wechat처럼 QR 모달로 뜨는 항목은 url이 비고 프론트가 정적 QR 이미지를 사용한다.
 * enabled: 노출 여부. order: 표시 순서(오름차순).
 */
export interface SiteSocialLink {
  platform: string
  url?: string
  enabled: boolean
  order: number
}

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

  @ApiProperty({ required: false, description: "진료시간 - 평일" })
  @Column({ name: "weekday_hours", length: 200, nullable: true })
  weekdayHours?: string

  @ApiProperty({ required: false, description: "진료시간 - 주말·공휴일" })
  @Column({ name: "weekend_hours", length: 200, nullable: true })
  weekendHours?: string

  @ApiProperty({ required: false, description: "진료시간 - 점심/안내 문구" })
  @Column({ name: "lunch_info", length: 300, nullable: true })
  lunchInfo?: string

  @ApiProperty({ required: false, description: "주차 안내 (어드민 전용, 웹 미노출)" })
  @Column({ name: "parking_info", type: "text", nullable: true })
  parkingInfo?: string

  @ApiProperty({ required: false, description: "대표자명 (푸터 표기)" })
  @Column({ name: "representative_name", length: 100, nullable: true })
  representativeName?: string

  @ApiProperty({ required: false, description: "사업자등록번호 (푸터 표기)" })
  @Column({ name: "business_registration_number", length: 50, nullable: true })
  businessRegistrationNumber?: string

  @ApiProperty({ required: false, description: "표시용 주소 (푸터·오시는길 노출용, 줄바꿈 허용)" })
  @Column({ name: "display_address", type: "text", nullable: true })
  displayAddress?: string

  @ApiProperty({ required: false, description: "약도·교통 안내 (예: 강남역 4번 출구 앞)" })
  @Column({ name: "landmark", length: 200, nullable: true })
  landmark?: string

  @ApiProperty({ required: false, description: "푸터·헤더 SNS 링크 목록 (언어별)" })
  @Column({ name: "social_links", type: "jsonb", nullable: true })
  socialLinks?: SiteSocialLink[]

  @ApiProperty({ required: false, description: "모든 언어 공통 노출 SNS 링크(같은 링크)" })
  @Column({ name: "common_social_links", type: "jsonb", nullable: true })
  commonSocialLinks?: SiteSocialLink[]

  @ApiProperty({ required: false, description: "대표 상담 채널 플랫폼 (상담 버튼·모바일 탭바 목적지)" })
  @Column({ name: "primary_consult_platform", length: 40, nullable: true })
  primaryConsultPlatform?: string

  @ApiProperty({ required: false, description: "대표 상담 채널 링크 (wechat 등 모달은 비움)" })
  @Column({ name: "primary_consult_url", type: "text", nullable: true })
  primaryConsultUrl?: string
}
