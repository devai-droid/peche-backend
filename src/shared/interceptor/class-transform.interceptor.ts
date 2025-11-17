import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { instanceToPlain } from "class-transformer"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable()
export class ClassTransformInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => instanceToPlain(data)))
  }
}
