import { JWTInfo } from "@root/shared/interface/auth"

export const INFRA_NAME = "peche"
export const SERVICE_NAME = "peche"
export const API_NAME = "base"
export const BULL_QUEUE_PREFIX = "bull-queue-prefix"
export const US_EAST_1 = "us-east-1"

export const STATIC_CONFIG = {
  AWS_KEY_TYPE_SECURE: "SecureString",
  AWS_DEFAULT_REGION: "ap-northeast-2",
  AWS_LOCAL_PROFILE: process.env.AWS_LOCAL_PROFILE || "peche",
  AWS_KMS_KEY_ID: process.env.KMS_KEY_ID,
  MEDIA_BASE_URL: undefined,
  IS_LOCAL_ENV: !!process.env.IS_LOCAL_ENV,
  STAGE: process.env.STAGE || "dev",
  JWT_INFO: {} as JWTInfo,
}

export const LOCAL_DEV_BACKEND_URL = "http://localhost:3007/api"
export const LOCAL_DEV_FRONTEND_URL = "http://localhost:8083"
export const PINPOINT_APP_ID = "33e10aa91f074a6d99868f2225c3591d"
