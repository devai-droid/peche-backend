import { MemberOccupation, MemberStatus } from "@root/shared/enum/system"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { Member } from "@root/system/entities/member.entity"

export interface MemberDto {
  status?: MemberStatus
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  namJA?: string
  nameTH?: string
  description?: string
  descriptionEN?: string
  descriptionZH?: string
  descriptionZHTW?: string
  descriptionJA?: string
  descriptionTH?: string
  occupation?: MemberOccupation
  birthDate?: string
  phoneNumber?: string
  joinDate?: string
  imageId?: string
  order?: number
}

export class CreateMemberDto implements MemberDto {
  @ApiPropertyOptional({ enum: MemberStatus })
  @IsOptional()
  @IsEnum(MemberStatus)
  readonly status?: MemberStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionTH?: string
  @ApiProperty({ enum: MemberOccupation }) @IsEnum(MemberOccupation) readonly occupation?: MemberOccupation
  @ApiPropertyOptional() @IsOptional() readonly birthDate?: string
  @ApiPropertyOptional() @IsOptional() readonly phoneNumber?: string
  @ApiPropertyOptional() @IsOptional() readonly joinDate?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class UpdateMemberDto implements MemberDto {
  @ApiPropertyOptional({ enum: MemberStatus })
  @IsOptional()
  @IsEnum(MemberStatus)
  readonly status?: MemberStatus
  @ApiPropertyOptional() @IsOptional() readonly name?: string
  @ApiPropertyOptional() @IsOptional() readonly nameEN?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZH?: string
  @ApiPropertyOptional() @IsOptional() readonly nameZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly nameJA?: string
  @ApiPropertyOptional() @IsOptional() readonly nameTH?: string
  @ApiPropertyOptional() @IsOptional() readonly description?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionEN?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZH?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionJA?: string
  @ApiPropertyOptional() @IsOptional() readonly descriptionTH?: string
  @ApiPropertyOptional({ enum: MemberOccupation })
  @IsOptional()
  @IsEnum(MemberOccupation)
  readonly occupation?: MemberOccupation
  @ApiPropertyOptional() @IsOptional() readonly birthDate?: string
  @ApiPropertyOptional() @IsOptional() readonly phoneNumber?: string
  @ApiPropertyOptional() @IsOptional() readonly joinDate?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
  @ApiPropertyOptional() @IsOptional() readonly order?: number
}

export class MemberList extends Paginated {
  @ApiProperty({ type: Member, isArray: true }) items: Member[]
}
