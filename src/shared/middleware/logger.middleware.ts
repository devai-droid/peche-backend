import { Injectable, Logger, NestMiddleware } from "@nestjs/common"
import { NextFunction, Request, Response } from "express"
import { getIpFromRequest } from "@root/shared/helper/base.helper"

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP")

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req
    const userAgent = req.get("user-agent") ?? ""
    const ipAddress = getIpFromRequest(req)
    res.on("finish", () => {
      const { statusCode } = res
      this.logger.log(
        `[ip: ${ipAddress}] [user_id: ${
          req.user ? req.user["id"] : "Anonymous"
        }] [${method} ${statusCode} ${originalUrl}] [${userAgent}]: ${JSON.stringify(req.body)}`,
      )
    })
    next()
  }
}
