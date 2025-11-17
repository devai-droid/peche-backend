import { ApiProperty } from "@nestjs/swagger"

export class PaginationMeta {
  @ApiProperty() itemCount: number
  @ApiProperty() totalItems: number
  @ApiProperty() itemsPerPage: number
  @ApiProperty() totalPages: number
  @ApiProperty() currentPage: number
}

export class Paginated {
  @ApiProperty() meta: PaginationMeta
}
