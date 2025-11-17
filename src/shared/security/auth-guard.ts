import { AuthGuard } from "@nestjs/passport"
import { JWT_STRATEGY } from "../constant/auth"

export class AllowAnonymousJWTGuard extends AuthGuard(JWT_STRATEGY) {
  handleRequest(err, user, info, context) {
    return user
  }
}
