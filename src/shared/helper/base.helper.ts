import { Request } from "express"

export function getIpFromRequest(request: Request) {
  return request.header("x-forwarded-for") ?? request.ip
}
