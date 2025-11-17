import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IPaginationOptions } from "@root/shared/pagination"
import { Brackets, SelectQueryBuilder } from "typeorm"
import { ObjectLiteral } from "typeorm/common/ObjectLiteral"
import { DtoHelper } from "../helper/dto.helper"

export enum SortOrder {
  DESC = "DESC",
  ASC = "ASC",
}

export class DefaultPaginationQuery {
  @ApiProperty({
    minimum: 1,
    default: 1,
    required: false,
  })
  page: number = 1

  @ApiProperty({
    default: 10,
    required: false,
  })
  limit: number = 10

  @ApiProperty({
    default: [SortOrder.DESC],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortOrder: SortOrder[] = [SortOrder.DESC]

  @ApiProperty({
    default: ["createdAt"],
    required: false,
  })
  @Transform(DtoHelper.explodeParamValue)
  sortBy: Array<string> = ["createdAt"]

  orderByOptions(entityName?: string) {
    const sortBys = this.sortBy
    const sortOrders = this.sortOrder
    return Object.assign(
      {},
      ...sortBys.map((sortBy, i) => ({ [`${entityName ? `${entityName}.` : ""}${sortBy}`]: sortOrders[i] })),
    )
  }

  queryBuilderOrderByOptions(entityName: string) {
    const sortBys = this.sortBy
    const sortOrders = this.sortOrder
    return sortBys.map((sortBy, i) => ({
      sortBy: `${entityName}.${sortBy}`,
      sortOrder: sortOrders[i],
    }))
  }

  paginationOptions(): IPaginationOptions {
    const limit = this.limit
    const page = this.page
    return { limit, page }
  }

  protected addInWhere(qb: SelectQueryBuilder<any>, entityName: string, fieldName: string) {
    if (this[fieldName]?.length && this[fieldName][0]) {
      qb.andWhere(`${entityName}.${fieldName} IN (:...${fieldName})`, { [fieldName]: this[fieldName] })
    }
  }

  protected addIdInWhere(qb: SelectQueryBuilder<any>, entityName: string, idField: string, fieldName: string) {
    if (this[fieldName]?.length && this[fieldName][0]) {
      qb.andWhere(`${entityName}.${idField} IN (:...${fieldName})`, { [fieldName]: this[fieldName] })
    }
  }

  protected addAndWhere(qb: SelectQueryBuilder<any>, where: ObjectLiteral) {
    qb.andWhere(new Brackets((qb) => qb.where(where)))
  }
}
