import { ApiProperty } from "@nestjs/swagger"
import { IsUUID } from "class-validator"
import { Paginated } from "@root/shared/dto/base-list.ro"
import { EventBackupBundle } from "@root/event/entities/event-backup-bundle.entity"

export interface EventBackupBundleDto {
  eventBundleId?: string
}

export class CreateEventBackupBundleDto implements EventBackupBundleDto {
  @ApiProperty() @IsUUID() eventBundleId: string
}

export class LoadEventBackupBundleDto implements EventBackupBundleDto {
  @ApiProperty() @IsUUID() eventBundleId: string
}

export class EventBackupBundleList extends Paginated {
  @ApiProperty({ type: EventBackupBundle, isArray: true }) items: EventBackupBundle[]
}
