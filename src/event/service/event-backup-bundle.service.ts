import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindManyOptions, Repository } from "typeorm"
import { paginate } from "@root/shared/pagination"
import { EventBackupBundle } from "@root/event/entities/event-backup-bundle.entity"
import { EventBackupService } from "@root/event/service/event-backup.service"
import { EventService } from "@root/event/service/event.service"
import { EventBackupBundleQueryDto } from "@root/event/dto/event-backup-bundle-query.dto"
import { CreateEventBackupBundleDto, LoadEventBackupBundleDto } from "@root/event/dto/event-backup-bundle.dto"

@Injectable()
export class EventBackupBundleService {
  constructor(
    @InjectRepository(EventBackupBundle) private repository: Repository<EventBackupBundle>,
    @Inject(forwardRef(() => EventBackupService))
    private readonly eventBackupService: EventBackupService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
  ) {}

  async create(dto: CreateEventBackupBundleDto) {
    const lastBundle = await this.findLastOne()
    const lastNumber = lastBundle ? Number(lastBundle.name) : 0
    const bundle = await this.repository.save(
      Object.assign(new EventBackupBundle(), {
        name: `${lastNumber + 1}`,
      }),
    )
    await this.eventBackupService.backup(bundle, dto.eventBundleId)
    return bundle
  }

  async findManyWithPaginationQuery(query?: EventBackupBundleQueryDto) {
    const findOptions = <FindManyOptions<EventBackupBundle>>{
      where: {},
      order: query.orderByOptions(),
    }
    return await paginate<EventBackupBundle>(this.repository, query.paginationOptions(), findOptions)
  }

  async findOne(id: string) {
    return this.repository.findOneOrFail({ where: { id: id } })
  }

  async findLastOne() {
    const result = await this.repository.find({
      skip: 0,
      take: 1,
      order: { name: "DESC" },
    })
    return result && result.length > 0 ? result[0] : undefined
  }

  async remove(id: string) {
    const bundle = await this.findOne(id)
    await this.eventBackupService.removeByBundleId(bundle.id)
    return this.repository.remove(bundle)
  }

  async loadBundle(id: string, dto: LoadEventBackupBundleDto) {
    const eventBackup = await this.eventBackupService.findAllByBackupBundleId(id)
    return await this.eventService.bulkCreateByBackup(dto.eventBundleId, eventBackup)
  }
}
