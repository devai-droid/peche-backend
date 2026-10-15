import { Injectable, Logger } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from "typeorm"
import { PiSyncService } from "./pi-sync.service"

/** PI 카탈로그에 실리는 표(엔티티 이름) — 이 표의 행이 저장·삭제되면 PI 동기화를 예약한다.
 *  클래스를 import 하지 않고 이름으로 맞춘다(엔티티 클래스를 여기서 먼저 import 하면 데코레이터 순서가 바뀌어 Swagger 순환 오류 — pi.module 주석). */
const WATCHED = new Set<string>(["Product", "ProductCategory", "ProductDetailPage", "Event", "EventBundle"])
const DEBOUNCE_MS = 3000

/**
 * 상품·분류·상세페이지·이벤트·번들 저장 → PI 동기화 트리거(엔티티 구독자).
 * 어드민 저장·시트 임포트·백업 복원·삭제 등 **모든 저장 경로**를 한 자리에서 잡는다(서비스마다 호출을 심지 않는다).
 * 임포트처럼 수백 건이 연달아 바뀌는 동안 매번 보내지 않도록 마지막 변경 뒤 3초에 한 번만 보낸다(best-effort, 실패는 로그).
 * 잡히지 않는 경로: `repository.update()`(쿼리빌더 — 구독자 미호출). 그런 자리(순서 변경)는 서비스가 직접 `syncSafe`를 부른다.
 */
@Injectable()
@EventSubscriber()
export class PiCatalogSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(PiCatalogSubscriber.name)
  private timer: ReturnType<typeof setTimeout> | null = null
  private pending = new Set<string>()

  constructor(@InjectDataSource() dataSource: DataSource, private readonly sync: PiSyncService) {
    dataSource.subscribers.push(this)
  }

  afterInsert(event: InsertEvent<unknown>): void {
    this.touch(event.metadata.name, "insert")
  }
  afterUpdate(event: UpdateEvent<unknown>): void {
    this.touch(event.metadata.name, "update")
  }
  afterRemove(event: RemoveEvent<unknown>): void {
    this.touch(event.metadata.name, "remove")
  }

  private touch(name: string, op: string): void {
    if (!WATCHED.has(name)) return
    this.pending.add(`${name}.${op}`)
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => this.flush(), DEBOUNCE_MS)
  }

  private flush(): void {
    this.timer = null
    const context = `catalog(${[...this.pending].join(",")})`
    this.pending.clear()
    this.sync.syncSafe(context).catch((e) => this.logger.warn(`PI 카탈로그 동기화 실패(${context}): ${(e as Error)?.message}`))
  }
}
