import {
  GetParametersByPathCommand,
  GetParametersCommand,
  ParameterType,
  PutParameterCommand,
  SSMClient,
} from "@aws-sdk/client-ssm"
import {
  INFRA_NAME,
  LOCAL_DEV_BACKEND_URL,
  LOCAL_DEV_FRONTEND_URL,
  SERVICE_NAME,
  STATIC_CONFIG,
  US_EAST_1,
} from "@root/shared/constant/static-config"
import { JWTInfo } from "@root/shared/interface/auth"
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses"
import { NO_REPLY_EMAIL_ADDRESS } from "@root/shared/constant/auth"
import { fromIni } from "@aws-sdk/credential-providers"
import { Env } from "@root/shared/enum/env"
import { SetSMSAttributesCommand, SNSClient } from "@aws-sdk/client-sns"

export class AwsHelper {
  static get config(): any {
    return {
      region: STATIC_CONFIG.AWS_DEFAULT_REGION,
      ...(STATIC_CONFIG.IS_LOCAL_ENV && { credentials: fromIni({ profile: STATIC_CONFIG.AWS_LOCAL_PROFILE }) }),
    }
  }

  static get client() {
    return new SSMClient(this.config)
  }

  static async prepareSmsMessage() {
    const TRANSACTIONAL = "Transactional"
    const client = new SNSClient(Object.assign({}, this.config, { region: US_EAST_1 }))
    const command = new SetSMSAttributesCommand({
      attributes: { DefaultSMSType: TRANSACTIONAL },
    })
    await client.send(command)
  }

  static async getParameter(name: string, whitDecryption?: boolean) {
    const command = new GetParametersCommand({
      Names: [name],
      WithDecryption: !!whitDecryption,
    })
    const { Parameters } = await this.client.send(command)
    return Parameters[0]?.Value
  }

  static async getParameters(names: string[], whitDecryption?: boolean) {
    const command = new GetParametersCommand({
      Names: names,
      WithDecryption: !!whitDecryption,
    })
    const { Parameters } = await this.client.send(command)
    return names.map((name) => {
      const param = Parameters.find((param) => param.Name == name)
      return param ? param.Value : undefined
    })
  }

  static async getParametersByPath(path: string, whitDecryption?: boolean) {
    const command = new GetParametersByPathCommand({
      Path: path,
      WithDecryption: whitDecryption,
    })
    const { Parameters } = await this.client.send(command)
    return Parameters
  }

  static async putParameter(name: string, value: any, whitDecryption?: boolean) {
    const command = new PutParameterCommand({
      Name: name,
      Value: value,
      Overwrite: true,
      ...(whitDecryption && {
        Type: ParameterType.SECURE_STRING,
        KeyId: STATIC_CONFIG.AWS_KMS_KEY_ID,
      }),
    })
    await this.client.send(command)
  }

  static async mediaConfig() {
    const mediaPath = `/${SERVICE_NAME}/${STATIC_CONFIG.STAGE}/media`
    const [mediaBucketName, mediaCloudfrontUrl, mediaDistributionId] = await this.getParameters([
      `${mediaPath}/bucket-name`,
      `${mediaPath}/distribution-url`,
      `${mediaPath}/distribution-id`,
    ])
    return {
      [Env.MEDIA_BUCKET_NAME]: mediaBucketName,
      [Env.MEDIA_CLOUDFRONT_URL]: mediaCloudfrontUrl,
      [Env.MEDIA_DISTRIBUTION_ID]: mediaDistributionId,
    }
  }

  static async getBaseUrlInfo() {
    const isLocalEnv = STATIC_CONFIG.IS_LOCAL_ENV || false
    let backendUrl = LOCAL_DEV_BACKEND_URL
    let frontendUrl = LOCAL_DEV_FRONTEND_URL
    if (!isLocalEnv) {
      const parameterPath = `/${INFRA_NAME}/${STATIC_CONFIG.STAGE}/base`
      const backendKey = `${parameterPath}/backend/url`
      const frontendKey = `${parameterPath}/frontend/url`
      backendUrl = await this.getParameter(backendKey)
      frontendUrl = await this.getParameter(frontendKey)
    }
    return { backend: backendUrl, frontend: frontendUrl }
  }

  static async getAuthInfo() {
    const basePath = `/${INFRA_NAME}/${STATIC_CONFIG.STAGE}/base`
    return {
      GOOGLE_OAUTH_CLIENT_ID: await this.getParameter(`${basePath}/auth/google/client-id`),
      KAKAO_APP_REST_KEY: await this.getParameter(`${basePath}/auth/kakao/app-rest-key`),
      KAKAO_APP_JAVASCRIPT_KEY: await this.getParameter(`${basePath}/auth/kakao/app-javascript-key`),
      KAKAO_APP_ADMIN_KEY: await this.getParameter(`${basePath}/auth/kakao/app-admin-key`, true),
      KAKAO_BIZ_MSG_APP_KEY: await this.getParameter(`${basePath}/kakao-biz/msg-app-key`),
      KAKAO_BIZ_MSG_APP_SECRET: await this.getParameter(`${basePath}/kakao-biz/msg-app-secret`, true),
      KAKAO_BIZ_MSG_SENDER_KEY: await this.getParameter(`${basePath}/kakao-biz/msg-sender-key`, true),
      DOCTOR_PALETTE_WEBHOOK_SECRET: await this.getParameter(`${basePath}/auth/palette/secret`),
    }
  }

  static async getJWTInfo(): Promise<JWTInfo> {
    const basePath = `/${INFRA_NAME}/${STATIC_CONFIG.STAGE}/base/auth`
    // /peche/dev/base/auth/jwt-secret
    return {
      JWT_SECRET: await this.getParameter(`${basePath}/jwt-secret`, true),
    }
  }

  static async sendVerificationEmail(email: string, code: string) {
    const subject = "Peche Email Verification"
    const urlInfo = await this.getBaseUrlInfo()
    const body = `Verification URL : ${urlInfo.frontend}/email-verification?email=${email}&code=${code}`
    return await this.sendSesEmail(email, subject, body)
  }

  static async sendPasswordResetEmail(email: string, code: string) {
    const subject = "Peche Password Reset"
    const urlInfo = await this.getBaseUrlInfo()
    const body = `Reset URL : ${urlInfo.frontend}/password-reset?email=${email}&code=${code}`
    return await this.sendSesEmail(email, subject, body)
  }

  private static async sendSesEmail(email: string, subject: string, body: string) {
    const client = new SESClient(Object.assign({}, this.config, { region: US_EAST_1 }))
    const command = new SendEmailCommand({
      Destination: {
        BccAddresses: [],
        CcAddresses: [],
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: body,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      ReplyToAddresses: [],
      Source: NO_REPLY_EMAIL_ADDRESS,
    })
    return await client.send(command)
  }
}
