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
    // 역할은 토큰 발급 시점이 아니라 DB 기준으로 판단(권한 회수 즉시 반영)
    const user = await this.authService.validateUser(payload)
    return { ...payload, roles: user.roles ?? [] }
  }
}
