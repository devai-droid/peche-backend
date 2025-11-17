import { FindManyOptions, FindOptionsWhere, ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm"
import { Pagination } from "./pagination"
import {
  CountQueryTypeEnum,
  IPaginationMeta,
  IPaginationOptions,
  PaginationTypeEnum,
  TypeORMCacheType,
} from "./interfaces"
import { createPaginationObject } from "./create-pagination"

const DEFAULT_LIMIT = 10
const DEFAULT_PAGE = 1

export async function paginate<T, CustomMetaType = IPaginationMeta>(
  repository: Repository<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
): Promise<Pagination<T, CustomMetaType>>
export async function paginate<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>>

export async function paginate<T, CustomMetaType = IPaginationMeta>(
  repositoryOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
) {
  return repositoryOrQueryBuilder instanceof Repository
    ? paginateRepository<T, CustomMetaType>(repositoryOrQueryBuilder, options, searchOptions)
    : paginateQueryBuilder<T, CustomMetaType>(repositoryOrQueryBuilder, options)
}

export async function paginateRaw<T, CustomMetaType extends ObjectLiteral = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>> {
  const [page, limit, route, paginationType, countQueries, countQueryType, cacheOption] = resolveOptions(options)

  const qb =
    paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)

  const items = await qb.cache(cacheOption).getRawMany<T>()

  const total = countQueries ? await countQuery(queryBuilder, cacheOption) : undefined

  return createPaginationObject<T, CustomMetaType>({
    items,
    totalItems: total,
    currentPage: page,
    limit,
    route,
    metaTransformer: options.metaTransformer,
    routingLabels: options.routingLabels,
  })
}

export async function paginateRawAndEntities<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<[Pagination<T, CustomMetaType>, Partial<T>[]]> {
  const [page, limit, route, paginationType, countQueries, countQueryType, cacheOption] = resolveOptions(options)

  const qb =
    paginationType === PaginationTypeEnum.LIMIT_AND_OFFSET
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)
  const itemObject = await qb.cache(cacheOption).getRawAndEntities<T>()
  let total
  if (countQueries) {
    total =
      countQueryType === CountQueryTypeEnum.RAW
        ? countQuery(queryBuilder, cacheOption)
        : queryBuilder.cache(cacheOption).getCount()
  }

  return [
    createPaginationObject<T, CustomMetaType>({
      items: itemObject.entities,
      totalItems: total,
      currentPage: page,
      limit,
      route,
      metaTransformer: options.metaTransformer,
      routingLabels: options.routingLabels,
    }),
    itemObject.raw,
  ]
}

function resolveOptions(
  options: IPaginationOptions<any>,
): [number, number, string, PaginationTypeEnum, boolean, CountQueryTypeEnum, TypeORMCacheType] {
  const page = resolveNumericOption(options, "page", DEFAULT_PAGE)
  const limit = resolveNumericOption(options, "limit", DEFAULT_LIMIT)
  const route = options.route
  const paginationType = options.paginationType || PaginationTypeEnum.LIMIT_AND_OFFSET
  const countQueries = typeof options.countQueries !== "undefined" ? options.countQueries : true
  const cacheQueries = options.cacheQueries || false
  const countQueryType = options.countQueryType || CountQueryTypeEnum.RAW

  return [page, limit, route, paginationType, countQueries, countQueryType, cacheQueries]
}

function resolveNumericOption(options: IPaginationOptions<any>, key: "page" | "limit", defaultValue: number): number {
  const value = options[key]
  const resolvedValue = Number(value)

  if (Number.isInteger(resolvedValue) && resolvedValue >= 0) return resolvedValue

  console.warn(
    `Query parameter "${key}" with value "${value}" was resolved as "${resolvedValue}", please validate your query input! Falling back to default "${defaultValue}".`,
  )
  return defaultValue
}

async function paginateRepository<T, CustomMetaType = IPaginationMeta>(
  repository: Repository<T>,
  options: IPaginationOptions<CustomMetaType>,
  searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
): Promise<Pagination<T, CustomMetaType>> {
  const [page, limit, route, _, countQueries] = resolveOptions(options)

  if (page < 1) {
    return createPaginationObject<T, CustomMetaType>({
      items: [],
      totalItems: 0,
      currentPage: page,
      limit,
      route,
      metaTransformer: options.metaTransformer,
      routingLabels: options.routingLabels,
    })
  }

  const total = countQueries
    ? await repository.count({
        ...searchOptions,
      })
    : undefined

  const items = await repository.find({
    skip: limit * (page - 1),
    take: limit,
    ...searchOptions,
  })

  return createPaginationObject<T, CustomMetaType>({
    items,
    totalItems: total,
    currentPage: page,
    limit,
    route,
    metaTransformer: options.metaTransformer,
    routingLabels: options.routingLabels,
  })
}

async function paginateQueryBuilder<T, CustomMetaType = IPaginationMeta>(
  queryBuilder: SelectQueryBuilder<T>,
  options: IPaginationOptions<CustomMetaType>,
): Promise<Pagination<T, CustomMetaType>> {
  const [page, limit, route, paginationType, countQueries, countQueryType, cacheOption] = resolveOptions(options)

  const qb =
    PaginationTypeEnum.LIMIT_AND_OFFSET === paginationType
      ? queryBuilder.limit(limit).offset((page - 1) * limit)
      : queryBuilder.take(limit).skip((page - 1) * limit)

  const items = await qb.cache(cacheOption).getMany()
  let total
  if (countQueries) {
    total =
      countQueryType === CountQueryTypeEnum.RAW
        ? await countQuery(queryBuilder, cacheOption)
        : await queryBuilder.cache(cacheOption).getCount()
  }

  return createPaginationObject<T, CustomMetaType>({
    items,
    totalItems: total,
    currentPage: page,
    limit,
    route,
    metaTransformer: options.metaTransformer,
    routingLabels: options.routingLabels,
  })
}

const countQuery = async <T>(queryBuilder: SelectQueryBuilder<T>, cacheOption: TypeORMCacheType): Promise<number> => {
  const totalQueryBuilder = queryBuilder.clone()

  totalQueryBuilder.skip(undefined).limit(undefined).offset(undefined).take(undefined).orderBy(undefined)

  const { value } = await queryBuilder.connection
    .createQueryBuilder()
    .select("COUNT(*)", "value")
    .from(`(${totalQueryBuilder.getQuery()})`, "uniqueTableAlias")
    .cache(cacheOption)
    .setParameters(queryBuilder.getParameters())
    .getRawOne<{ value: string }>()

  return Number(value)
}
