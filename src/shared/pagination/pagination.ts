import { IPaginationLinks, IPaginationMeta, ObjectLiteral } from "./interfaces"

export class Pagination<PaginationObject, T extends ObjectLiteral = IPaginationMeta> {
  constructor(
    public readonly items: PaginationObject[],
    public readonly meta: T,
    public readonly links?: IPaginationLinks,
  ) {}
}
