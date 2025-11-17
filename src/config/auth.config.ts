import { AwsHelper } from "@root/shared/helper/aws.helper"
import { Env } from "@root/shared/enum/env"

export default async () => {
  const authEnv = await AwsHelper.getAuthInfo()
  return {
    [Env.KAKAO_APP_REST_KEY]: authEnv.KAKAO_APP_REST_KEY,
    [Env.KAKAO_APP_ADMIN_KEY]: authEnv.KAKAO_APP_ADMIN_KEY,
    [Env.KAKAO_APP_JAVASCRIPT_KEY]: authEnv.KAKAO_APP_JAVASCRIPT_KEY,
    [Env.KAKAO_BIZ_MSG_APP_KEY]: authEnv.KAKAO_BIZ_MSG_APP_KEY,
    [Env.KAKAO_BIZ_MSG_APP_SECRET]: authEnv.KAKAO_BIZ_MSG_APP_SECRET,
    [Env.KAKAO_BIZ_MSG_SENDER_KEY]: authEnv.KAKAO_BIZ_MSG_SENDER_KEY,
  }
}
