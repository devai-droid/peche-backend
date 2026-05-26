import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsOptional, IsString } from "class-validator"

export class UpdateCommonTextDto {
  @ApiProperty({ required: false, description: "고지문구 본문" })
  @IsOptional()
  @IsString()
  body?: string

  @ApiProperty({ required: false, description: "활성화 여부" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdatePostNoticesDto {
  @ApiProperty({ type: [String], description: "이 글에 적용할 고지문구 type 목록 (일반 면책 제외)" })
  @IsOptional()
  @IsString({ each: true })
  notices?: string[]
}
