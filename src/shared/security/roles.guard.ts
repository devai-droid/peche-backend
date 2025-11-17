import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import * as jwt from "jsonwebtoken"
import { Role } from "../enum/auth"
import { ROLES_KEY } from "../decorator/auth-user.decorator"
import { JwtPayload } from "../interface/auth"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const token = request.headers.authorization?.split(" ")[1]
    if (!token) return false
    const user = jwt.decode(token) as JwtPayload

    return requiredRoles.some((role) => user.roles?.includes(role))
  }
}
