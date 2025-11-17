import { HttpException, HttpStatus } from "@nestjs/common"

export class PaymentException extends HttpException {
  constructor(message: string, e?: Error) {
    let status = HttpStatus.BAD_REQUEST
    if (e && e instanceof PaymentException) {
      message = e.message
    } else if (e && !(e instanceof PaymentException)) {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      console.error(e)
    }
    super(message, status)
  }
}
