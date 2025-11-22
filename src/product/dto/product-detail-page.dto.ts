import { ProductDetailPageStatus } from "@root/shared/enum/product"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsUUID, ValidateIf } from "class-validator"
import { ProductDetailPage } from "@root/product/entities/product-detail-page.entity"
import { Paginated } from "@root/shared/dto/base-list.ro"

export interface ProductDetailPageDto {
  categoryId?: string
  status?: ProductDetailPageStatus
  name?: string
  nameEN?: string
  nameZH?: string
  nameZHTW?: string
  nameJA?: string
  nameTH?: string
  description?: string
  descriptionEN?: string
  descriptionZH?: string
  descriptionZHTW?: string
  descriptionJA?: string
  descriptionTH?: string
  referenceUrl?: string
  procedure?: string
  procedureEN?: string
  procedureZH?: string
  procedureZHTW?: string
  procedureJA?: string
  procedureTH?: string
  information?: string
  informationEN?: string
  informationZH?: string
  informationZHTW?: string
  informationJA?: string
  informationTH?: string
  advantages?: string
  advantagesEN?: string
  advantagesZH?: string
  advantagesZHTW?: string
  advantagesJA?: string
  advantagesTH?: string
  target?: string
  targetEN?: string
  targetZH?: string
  targetZHTW?: string
  targetJA?: string
  targetTH?: string
  qAndA?: string
  qAndAEN?: string
  qAndAZH?: string
  qAndAZHTW?: string
  qAndAJA?: string
  qAndATH?: string
  caution?: string
  cautionEN?: string
  cautionZH?: string
  cautionZHTW?: string
  cautionJA?: string
  cautionTH?: string
  relatedDetailPageIds?: string[]
  order?: number
  imageId?: string
}

export class CreateProductDetailPageDto implements ProductDetailPageDto {
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_, value) => value !== null) @IsUUID() readonly categoryId?:
    | string
    | null
  @ApiPropertyOptional({ enum: ProductDetailPageStatus })
  @IsOptional()
  @IsEnum(ProductDetailPageStatus)
  readonly status?: ProductDetailPageStatus
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
  @ApiPropertyOptional() @IsOptional() readonly referenceUrl?: string
  @ApiPropertyOptional() @IsOptional() readonly procedure?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureEN?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureZH?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureJA?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureTH?: string
  @ApiPropertyOptional() @IsOptional() readonly information?: string
  @ApiPropertyOptional() @IsOptional() readonly informationEN?: string
  @ApiPropertyOptional() @IsOptional() readonly informationZH?: string
  @ApiPropertyOptional() @IsOptional() readonly informationZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly informationJA?: string
  @ApiPropertyOptional() @IsOptional() readonly informationTH?: string
  @ApiPropertyOptional() @IsOptional() readonly advantages?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesEN?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesZH?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesJA?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesTH?: string
  @ApiPropertyOptional() @IsOptional() readonly target?: string
  @ApiPropertyOptional() @IsOptional() readonly targetEN?: string
  @ApiPropertyOptional() @IsOptional() readonly targetZH?: string
  @ApiPropertyOptional() @IsOptional() readonly targetZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly targetJA?: string
  @ApiPropertyOptional() @IsOptional() readonly targetTH?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndA?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndAEN?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndAZH?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndAZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndAJA?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndATH?: string
  @ApiPropertyOptional() @IsOptional() readonly caution?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionEN?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionZH?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionJA?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionTH?: string
  @ApiPropertyOptional() @IsOptional() readonly relatedDetailPageIds?: string[]
  @ApiPropertyOptional() @IsOptional() order?: number
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
}

export class UpdateProductDetailPageDto implements ProductDetailPageDto {
  @ApiPropertyOptional() @IsOptional() @ValidateIf((_, value) => value !== null) @IsUUID() readonly categoryId?:
    | string
    | null
  @ApiPropertyOptional({ enum: ProductDetailPageStatus })
  @IsOptional()
  @IsEnum(ProductDetailPageStatus)
  readonly status?: ProductDetailPageStatus
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
  @ApiPropertyOptional() @IsOptional() readonly referenceUrl?: string
  @ApiPropertyOptional() @IsOptional() readonly procedure?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureEN?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureZH?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureJA?: string
  @ApiPropertyOptional() @IsOptional() readonly procedureTH?: string
  @ApiPropertyOptional() @IsOptional() readonly information?: string
  @ApiPropertyOptional() @IsOptional() readonly informationEN?: string
  @ApiPropertyOptional() @IsOptional() readonly informationZH?: string
  @ApiPropertyOptional() @IsOptional() readonly informationZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly informationJA?: string
  @ApiPropertyOptional() @IsOptional() readonly informationTH?: string
  @ApiPropertyOptional() @IsOptional() readonly advantages?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesEN?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesZH?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesJA?: string
  @ApiPropertyOptional() @IsOptional() readonly advantagesTH?: string
  @ApiPropertyOptional() @IsOptional() readonly target?: string
  @ApiPropertyOptional() @IsOptional() readonly targetEN?: string
  @ApiPropertyOptional() @IsOptional() readonly targetZH?: string
  @ApiPropertyOptional() @IsOptional() readonly targetZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly targetJA?: string
  @ApiPropertyOptional() @IsOptional() readonly targetTH?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndA?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndAEN?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndAZH?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndAZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndAJA?: string
  @ApiPropertyOptional() @IsOptional() readonly qAndATH?: string
  @ApiPropertyOptional() @IsOptional() readonly caution?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionEN?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionZH?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionZHTW?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionJA?: string
  @ApiPropertyOptional() @IsOptional() readonly cautionTH?: string
  @ApiPropertyOptional() @IsOptional() readonly relatedDetailPageIds?: string[]
  @ApiPropertyOptional() @IsOptional() order?: number
  @ApiPropertyOptional() @IsOptional() @IsUUID() readonly imageId?: string
}

export class ProductDetailPageList extends Paginated {
  @ApiProperty({ type: ProductDetailPage, isArray: true }) items: ProductDetailPage[]
}
