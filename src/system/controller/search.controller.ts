import { Controller, Get, Query } from "@nestjs/common"
import { ApiOkResponse, ApiTags } from "@nestjs/swagger"
import { SearchResultList } from "@root/system/dto/search.dto"
import { SearchQueryDto } from "@root/system/dto/search-query.dto"
import { SearchService } from "@root/system/service/search.service"

@Controller("search")
@ApiTags("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOkResponse({ type: SearchResultList })
  @Get("")
  async findMany(@Query() query: SearchQueryDto) {
    return this.searchService.search(query)
  }
}
