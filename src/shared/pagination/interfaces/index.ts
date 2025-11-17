export enum PaginationTypeEnum {
  LIMIT_AND_OFFSET = "limit",
  TAKE_AND_SKIP = "take",
}

export interface IPaginationOptions<CustomMetaType = IPaginationMeta> {
  // default 10
  limit: number | string
  // default 1
  page: number | string
  route?: string
  metaTransformer?: (meta: IPaginationMeta) => CustomMetaType
  routingLabels?: IPaginationOptionsRoutingLabels
  paginationType?: PaginationTypeEnum
  countQueries?: boolean
  countQueryType?: CountQueryTypeEnum
  cacheQueries?: TypeORMCacheType
}

export type TypeORMCacheType =
  | boolean
  | number
  | {
      id: any
      milliseconds: number
    }

export interface ObjectLiteral {
  [s: string]: any
}

export interface IPaginationMeta extends ObjectLiteral {
  itemCount: number
  totalItems?: number
  itemsPerPage: number
  totalPages?: number
  currentPage: number
}

export interface IPaginationLinks {
  first?: string
  previous?: string
  next?: string
  last?: string
}

export interface IPaginationOptionsRoutingLabels {
  limitLabel?: string
  pageLabel?: string
}

export enum CountQueryTypeEnum {
  RAW = "raw",
  ENTITY = "entity",
}
