import { NestFactory } from "@nestjs/core"
import { NestExpressApplication } from "@nestjs/platform-express"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ConfigService } from "@nestjs/config"
import { join } from "path"
import * as express from "express"
import helmet from "helmet"
import { AppModule } from "./app.module"
import { SERVICE_NAME, STATIC_CONFIG } from "./shared/constant/static-config"
import { Env } from "./shared/enum/env"
import { SWAGGER_TOKEN_NAME } from "./shared/constant/auth"
import { BadRequestException, Logger, RequestMethod, ValidationError, ValidationPipe } from "@nestjs/common"
import { ClassTransformInterceptor } from "./shared/interceptor/class-transform.interceptor"
import { EntityPropertyNotFoundFilter } from "./shared/exception/entity-property-not-found.filter"
import { EntityNotFoundFilter } from "./shared/exception/entity-not-found.filter"
import { AuthExceptionFilter } from "./shared/exception/auth-exception.filter"
import { AwsHelper } from "@root/shared/helper/aws.helper"
import { json, urlencoded } from "body-parser"

async function bootstrap() {
  STATIC_CONFIG.JWT_INFO = await AwsHelper.getJWTInfo()
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true })

  // 로컬 환경: S3 fallback 이미지 정적 서빙 (admin 8087에서 로드 가능하게 CORP 완화)
  if (process.env.IS_LOCAL_ENV === "1") {
    app.useStaticAssets(join(process.cwd(), "uploads"), {
      prefix: "/uploads",
      setHeaders: (res) => {
        res.set("Cross-Origin-Resource-Policy", "cross-origin")
        res.set("Access-Control-Allow-Origin", "*")
      },
    })
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${SERVICE_NAME.toUpperCase()} API`)
    .setDescription(`The ${SERVICE_NAME.toUpperCase()} API description`)
    .setVersion("0.1")
    .addTag(`${SERVICE_NAME.toUpperCase()}`)
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "Token", in: "header" }, SWAGGER_TOKEN_NAME)
    .build()

  const config = app.get(ConfigService)
  const port = config.get<number>(Env.PORT)
  const globalPrefix = config.get<string>(Env.GLOBAL_PREFIX, "api")

  app.setGlobalPrefix(globalPrefix, {
    // 공개 블로그 SSR은 /api 프리픽스 없이 /{lang}/blog[/{slug}] 로 서빙
    exclude: [
      { path: ":lang/blog", method: RequestMethod.GET },
      { path: ":lang/blog/:slug", method: RequestMethod.GET },
    ],
  })
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: false,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException(errors.map((error) => Object.assign(error, { target: undefined }))),
    }),
  )
  app.useGlobalInterceptors(new ClassTransformInterceptor())
  app.useGlobalFilters(new EntityPropertyNotFoundFilter(), new EntityNotFoundFilter(), new AuthExceptionFilter())
  app.use(helmet())

  SwaggerModule.setup(`${globalPrefix}/docs`, app, SwaggerModule.createDocument(app, swaggerConfig))

  app.use(json({ limit: "50mb" }))
  app.use(urlencoded({ limit: "50mb", extended: true }))

  STATIC_CONFIG.MEDIA_BASE_URL = `${config.get<string>(Env.MEDIA_CLOUDFRONT_URL)}`

  // Serve static sitemap.xml
  const sitemapPath = join(__dirname, "..", "public", "sitemap.xml") // Adjust the path as needed
  app.use("/sitemap.xml", express.static(sitemapPath))

  // Serve favicon.ico
  const faviconPath = join(__dirname, "..", "public", "favicon.ico")
  app.use("/favicon.ico", express.static(faviconPath))

  await app.startAllMicroservices()
  await AwsHelper.prepareSmsMessage()
  await app.listen(port, "0.0.0.0")

  Logger.log(`Server running on ${port}`, "Bootstrap")
}

bootstrap()
