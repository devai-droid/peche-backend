import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common"
import { Request, Response } from "express"
import { EntityPropertyNotFoundError } from "typeorm"

@Catch(EntityPropertyNotFoundError)
export class EntityPropertyNotFoundFilter implements ExceptionFilter {
  catch(exception: EntityPropertyNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = HttpStatus.BAD_REQUEST
    Logger.error(`${request.url}: ${exception.message}`)

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: "wrong query params",
    })
  }
}
