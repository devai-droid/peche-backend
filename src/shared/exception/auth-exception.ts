import { AuthExceptionType } from "../enum/auth"

export class AuthException extends Error {
  private type: AuthExceptionType

  constructor(type: AuthExceptionType, message?: string) {
    super()
    this.type = type
    this.message = message ?? type.toString()
  }
}
