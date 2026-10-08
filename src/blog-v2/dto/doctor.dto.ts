import { ApiProperty, PartialType } from "@nestjs/swagger"
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator"
import { Type } from "class-transformer"

export class CreateBlogDoctorDto {
  @ApiProperty({ required: false, description: "언어 (ko/en/zh/zh-TW/ja/th)" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  lang?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  specialty?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  jobTitle?: string

  @ApiProperty({ required: false, description: "의료진 소개글 (블로그 의료진 카드 공통 노출)" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  associations?: string[]

  @ApiProperty({ required: false, description: "면허번호 (외부 비공개)" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profileUrl?: string

  @ApiProperty({ required: false, description: "의료진 소개 페이지 사진" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string

  @ApiProperty({ required: false, description: "블로그 카드 전용 사진(없으면 photoUrl)" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  blogPhotoUrl?: string

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean

  @ApiProperty({ required: false, description: "블로그 의료진 카드 연결 여부(켠 의료진만 블로그 카드에 사용)" })
  @IsOptional()
  @IsBoolean()
  linkedToBlogCard?: boolean
}

export class UpdateBlogDoctorDto extends PartialType(CreateBlogDoctorDto) {}

export class QueryBlogDoctorDto {
  @ApiProperty({ required: false, description: "언어 필터" })
  @IsOptional()
  @IsString()
  lang?: string

  @ApiProperty({ required: false, description: "true=공개만, false=숨김 포함" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  visibleOnly?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiProperty({ required: false, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50
}
