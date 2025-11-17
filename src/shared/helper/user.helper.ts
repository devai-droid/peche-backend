import { Role } from "@root/shared/enum/auth"
import { User } from "@root/shared/interface/user"

export class UserHelper {
  static isAdmin(user?: User) {
    return user?.roles.find((role) => role == Role.ADMIN) ?? false
  }
}
