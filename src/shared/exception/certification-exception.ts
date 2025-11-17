import { HttpException, HttpStatus } from "@nestjs/common"

export class CertificationException extends HttpException {
  constructor(message: string) {
    const status = HttpStatus.INTERNAL_SERVER_ERROR
    super(message, status)
  }
}
