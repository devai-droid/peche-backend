import { Env } from "../shared/enum/env"
import { AwsHelper } from "@root/shared/helper/aws.helper"

export default async () => {
  return {
    [Env.PORT]: parseInt(process.env.PORT, 10) || 3000,
    [Env.STAGE]: process.env.STAGE || "dev",
    [Env.SCHEDULER]: process.env.SCHEDULER || 1,
    [Env.PUBLICATION_CODE]: process.env.PUBLICATION_CODE || "all",
    ...(await AwsHelper.mediaConfig()),
  }
}
