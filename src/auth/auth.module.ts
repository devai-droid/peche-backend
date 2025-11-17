import { forwardRef, Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"
import { AuthService } from "./service/auth.service"
import { JwtStrategy } from "./service/jwt.strategy"
import { JWT_EXPIRED_IN_30_DAYS, JWT_STRATEGY } from "../shared/constant/auth"
import { AuthController } from "./controller/auth.controller"
import { UsersModule } from "../users/users.module"
import { VerificationService } from "./service/verification.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigService } from "@nestjs/config"
import { KakaoRepository } from "@root/auth/repository/kakao.repository"
import { STATIC_CONFIG } from "@root/shared/constant/static-config"
import { AdminAuthController } from "@root/auth/controller/admin-auth.controller"
import { MessageModule } from "@root/message/message.module"
import { VerificationCode } from "@root/auth/entities/verification-code.entity"
import { AuthCode } from "@root/auth/entities/auth-code.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode, AuthCode]),
    PassportModule.register({ defaultStrategy: JWT_STRATEGY }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async () => ({
        secret: STATIC_CONFIG.JWT_INFO.JWT_SECRET,
        signOptions: { expiresIn: JWT_EXPIRED_IN_30_DAYS },
      }),
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [AuthController, AdminAuthController],
  providers: [JwtStrategy, AuthService, VerificationService, KakaoRepository],
  exports: [AuthService, VerificationService],
})
export class AuthModule {}
