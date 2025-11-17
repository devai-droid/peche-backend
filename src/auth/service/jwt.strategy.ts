import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import { ExtractJwt, Strategy } from "passport-jwt"
import { JWT_STRATEGY } from "../../shared/constant/auth"
import { JwtPayload } from "../../shared/interface/auth"
import { AuthService } from "./auth.service"
import { STATIC_CONFIG } from "@root/shared/constant/static-config"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: STATIC_CONFIG.JWT_INFO.JWT_SECRET,
    })
  }

  async validate(payload: JwtPayload) {
    await this.authService.validateUser(payload)
    return payload
  }
}
