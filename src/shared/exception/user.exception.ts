import { UnauthorizedException } from "@nestjs/common"

export class UserDoesNotHavPermission extends UnauthorizedException {
  constructor() {
    super("AccountUser does not have permission")
  }
}
