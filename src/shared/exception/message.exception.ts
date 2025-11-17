import { ErrorCode } from "@root/shared/enum/error-code"

export class MessageException extends Error {
  status = ErrorCode.BAD_REQUEST

  constructor(message: string, status?: ErrorCode) {
    super()
    this.message = message
    this.status = status ? status : ErrorCode.BAD_REQUEST
  }
}
