import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SystemConstants } from "@root/system/entities/system-constants.entity"
import { CreateOrUpdateSystemConstantsDto } from "@root/system/dto/system-constants.dto"
import { SystemConstantsKey } from "@root/shared/enum/system"

@Injectable()
export class SystemConstantsService {
  constructor(@InjectRepository(SystemConstants) private repository: Repository<SystemConstants>) {}

  async createOrUpdate(dto: CreateOrUpdateSystemConstantsDto) {
    return await this.repository.save(dto)
  }

  async findOne(key: SystemConstantsKey) {
    return this.repository.findOneOrFail({ where: { key: key } })
  }

  async findOneOrNull(key: SystemConstantsKey) {
    return this.repository.findOne({ where: { key: key } })
  }
}
