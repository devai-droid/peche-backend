import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { User } from "@root/shared/interface/user"
import { CreateHospitalInfoDto, UpdateHospitalInfoDto } from "@root/system/dto/hospital-info.dto"
import { HospitalInfo } from "@root/system/entities/hospital-info.entity"

@Injectable()
export class HospitalInfoService {
  constructor(@InjectRepository(HospitalInfo) private repository: Repository<HospitalInfo>) {}

  async create(dto: CreateHospitalInfoDto) {
    return await this.repository.save(dto)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAll() {
    return this.repository.find()
  }

  async update(id: string, dto: UpdateHospitalInfoDto, user?: User) {
    const hospitalInfo = await this.findOne(id)
    return this.repository.save(
      Object.assign(hospitalInfo, dto, {
        updatedBy: user?.id,
      }),
    )
  }

  async remove(id: string) {
    const hospitalInfo = await this.findOne(id)
    return this.repository.remove(hospitalInfo)
  }
}
