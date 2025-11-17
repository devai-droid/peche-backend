import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { FileService } from "@root/file/service/files.service"
import { paginate } from "@root/shared/pagination"
import { MemberStatus } from "@root/shared/enum/system"
import { User } from "@root/shared/interface/user"
import { Member } from "@root/system/entities/member.entity"
import { CreateMemberDto, UpdateMemberDto } from "../dto/member.dto"
import { MemberQueryDto } from "@root/system/dto/member-query.dto"

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private repository: Repository<Member>,
    @Inject(forwardRef(() => FileService)) private readonly fileService: FileService,
  ) {}

  async create(dto: CreateMemberDto) {
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    return await this.repository.save(
      Object.assign(dto, {
        ...(image && { image: image }),
      }),
    )
  }

  async findManyWithPaginationQuery(query?: MemberQueryDto) {
    const findOptions = <FindManyOptions<Member>>{
      where: {
        ...(query?.status && { status: query.status }),
        ...(query?.occupation && { occupation: query.occupation }),
      },
      order: query.orderByOptions(),
    }
    return await paginate<Member>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findAllActive() {
    return this.repository.find({ where: { status: MemberStatus.ACTIVE } })
  }

  async update(id: string, dto: UpdateMemberDto, user?: User) {
    const member = await this.findOne(id)
    const image = dto.imageId ? await this.fileService.findOne(dto.imageId) : undefined
    return this.repository.save(
      Object.assign(member, dto, {
        updatedBy: user?.id,
        ...(image && { image: image }),
      }),
    )
  }

  async remove(id: string) {
    const member = await this.findOne(id)
    return this.repository.remove(member)
  }
}
