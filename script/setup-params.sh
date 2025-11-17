#!/bin/sh
infra_name=peche
stage=dev
base_api_name=base
profile_and_region="--profile peche --region ap-northeast-2"

# 이미 배포된 환경변수
#JWT_SECRET="JWT_SECRET"
#KAKAO_APP_REST_KEY="KAKAO_APP_REST_KEY"
#KAKAO_APP_ADMIN_KEY="KAKAO_APP_ADMIN_KEY"
#KAKAO_APP_JAVASCRIPT_KEY="KAKAO_APP_JAVASCRIPT_KEY"

# 비즈톡 등록 후 배포할 환경변수
KAKAO_BIZ_MSG_APP_KEY="KAKAO_BIZ_MSG_APP_KEY"
KAKAO_BIZ_MSG_APP_SECRET="KAKAO_BIZ_MSG_APP_SECRET"
KAKAO_BIZ_MSG_SENDER_KEY="KAKAO_BIZ_MSG_SENDER_KEY"

# put parameter store auth values
echo "setup parameter store auth values..."

#aws $profile_and_region ssm put-parameter --name "/$infra_name/$stage/$base_api_name/auth/jwt-secret" \
#    --type "SecureString" --value $JWT_SECRET --overwrite

#aws $profile_and_region ssm put-parameter --name "/$infra_name/$stage/$base_api_name/auth/kakao/app-rest-key" \
#    --type "String" --value $KAKAO_APP_REST_KEY --overwrite
#aws $profile_and_region ssm put-parameter --name "/$infra_name/$stage/$base_api_name/auth/kakao/app-admin-key" \
#    --type "SecureString" --value $KAKAO_APP_ADMIN_KEY --overwrite
#aws $profile_and_region ssm put-parameter --name "/$infra_name/$stage/$base_api_name/auth/kakao/app-javascript-key" \
#    --type "String" --value $KAKAO_APP_JAVASCRIPT_KEY --overwrite

aws $profile_and_region ssm put-parameter --name "/$infra_name/$stage/$base_api_name/kakao-biz/msg-app-key" \
    --type "String" --value $KAKAO_BIZ_MSG_APP_KEY --overwrite
aws $profile_and_region ssm put-parameter --name "/$infra_name/$stage/$base_api_name/kakao-biz/msg-app-secret" \
    --type "SecureString" --value $KAKAO_BIZ_MSG_APP_SECRET --overwrite
aws $profile_and_region ssm put-parameter --name "/$infra_name/$stage/$base_api_name/kakao-biz/msg-sender-key" \
    --type "SecureString" --value $KAKAO_BIZ_MSG_SENDER_KEY --overwrite
