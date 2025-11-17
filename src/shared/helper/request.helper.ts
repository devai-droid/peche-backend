import { NotFoundException } from "@nestjs/common"
import * as uuid from "uuid"
import { Role } from "../enum/auth"
import { User } from "../interface/user"
import { UserDoesNotHavPermission } from "../exception/user.exception"

export class RequestHelper {
  static validateUuidId(id: string) {
    if (!uuid.validate(id)) {
      throw new NotFoundException()
    }
  }

  static validateUuidIds(ids: string[]) {
    for (const id of ids) {
      if (!uuid.validate(id)) {
        throw new NotFoundException()
      }
    }
  }

  static checkUserRole(userRoles?: Role[], requiredRole?: Role) {
    return userRoles && requiredRole && userRoles.some((role) => role == requiredRole)
  }

  static checkUserOrAdmin(userId: string, user?: User) {
    if (userId != user?.id || RequestHelper.checkUserRole(user?.roles, Role.ADMIN)) {
      throw new UserDoesNotHavPermission()
    }
  }
}
