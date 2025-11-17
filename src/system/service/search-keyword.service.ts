import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { User } from "@root/shared/interface/user"
import { SearchKeyword } from "@root/system/entities/search-keyword.entity"
import { CreateSearchKeywordDto, UpdateSearchKeywordDto } from "@root/system/dto/search-keyword.dto"
import { SearchKeywordQueryDto } from "@root/system/dto/search-keyword-query.dto"

@Injectable()
export class SearchKeywordService {
  constructor(@InjectRepository(SearchKeyword) private repository: Repository<SearchKeyword>) {}

  async create(dto: CreateSearchKeywordDto) {
    return await this.repository.save(dto)
  }

  async findManyWithPaginationQuery(query?: SearchKeywordQueryDto) {
    const findOptions = <FindManyOptions<SearchKeyword>>{
      where: {
        ...(query?.languageLocale && { languageLocale: query.languageLocale }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<SearchKeyword>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async update(id: string, dto: UpdateSearchKeywordDto, user?: User) {
    const searchKeyword = await this.findOne(id)
    return this.repository.save(Object.assign(searchKeyword, dto, { updatedBy: user?.id }))
  }

  async remove(id: string) {
    const searchKeyword = await this.findOne(id)
    return this.repository.remove(searchKeyword)
  }
}
