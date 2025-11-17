import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, Type, UseGuards } from "@nestjs/common"
import { Role } from "../enum/auth"
import { ApiBearerAuth } from "@nestjs/swagger"
import { IAuthGuard } from "@nestjs/passport/dist/auth.guard"

export const AuthUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})

export const ROLES_KEY = "roles"
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

export function Auth(authGuard: Type<IAuthGuard>, token: string, ...roles: Role[]) {
  return applyDecorators(Roles(...roles), UseGuards(authGuard), ApiBearerAuth(token))
}
