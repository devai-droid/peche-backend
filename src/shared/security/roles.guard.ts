import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Role } from "../enum/auth"
import { ROLES_KEY } from "../decorator/auth-user.decorator"
import { JwtPayload } from "../interface/auth"

/**
 * @Auth(..., Role.X) 로 지정한 역할을 검사한다. JWT 검증(AuthGuard) 뒤에 실행된다.
 * - Role.USER: 로그인만 되어 있으면 통과(역할 배열이 비어 있는 기존 회원 호환)
 * - Role.ADMIN: DB 기준 역할(jwt.strategy validate 에서 갱신)에 ADMIN 이 있어야 통과
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const user = context.switchToHttp().getRequest().user as JwtPayload | undefined
    if (!user) return false
    if (requiredRoles.includes(Role.USER)) return true

    return requiredRoles.some((role) => user.roles?.includes(role))
  }
}
