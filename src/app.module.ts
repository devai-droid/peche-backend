import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import * as path from "path"
import configuration from "./config/configuration"
import authConfiguration from "./config/auth.config"
import { ormConfig } from "@root/config/orm.config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { UsersModule } from "@root/users/users.module"
import { AuthModule } from "@root/auth/auth.module"
import { SmartDoctorModule } from "@root/smart-doctor/smart-doctor.module"
import { ProductModule } from "@root/product/product.module"
import { EventModule } from "@root/event/event.module"
import { FileModule } from "@root/file/file.module"
import { HealthModule } from "@root/health/health.module"
import { AcceptLanguageResolver, I18nModule, QueryResolver } from "nestjs-i18n"
import { MessageModule } from "@root/message/message.module"
import { ReservationModule } from "@root/reservation/reservation.module"
import { SystemModule } from "@root/system/system.module"
import { LoggerMiddleware } from "@root/shared/middleware/logger.middleware"
import { AdminModule } from "@root/admin/auth.module"
import { ScheduleModule } from "@nestjs/schedule"
import { BlogModule } from "@root/blog/blog.module"
import { UploadModule } from "@root/upload/upload.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [configuration, authConfiguration],
    }),
    I18nModule.forRoot({
      fallbackLanguage: "ko",
      loaderOptions: {
        path: path.join(__dirname, "/shared/i18n/"),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver, { use: QueryResolver, options: ["lang"] }],
    }),
    TypeOrmModule.forRoot(ormConfig),
    ScheduleModule.forRoot(),
    HealthModule,
    UsersModule,
    AuthModule,
    SmartDoctorModule,
    ProductModule,
    EventModule,
    FileModule,
    MessageModule,
    ReservationModule,
    SystemModule,
    AdminModule,
    BlogModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*")
  }
}
