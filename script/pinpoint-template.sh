#!/bin/sh

profile_and_region="--profile peche --region ap-northeast-2"

# 기존 예약 취소 템플릿 (영어)
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CANCELLATION_TEMPLATE_EN" \
  --sms-template-request '{
    "Body": "Your reservation was canceled at {{datetime}}. For inquiries, please contact us through Whatsapp or Instagram DM.\nWhatsapp : +821027694410\nInstagram ID : pecheclinic.eng",
    "TemplateDescription": "Template for reservation cancellation notifications in English"
  }'

# 일본어 예약 취소 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CANCELLATION_TEMPLATE_JP" \
  --sms-template-request '{
    "Body": "お客様、{{datetime}}の予約をキャンセルさせていただきました。お問い合わせは【LINE】にてお願いいたします。\nLINE ID : @pecheclinic",
    "TemplateDescription": "Template for reservation cancellation notifications in Japanese"
  }'

# 중국어 예약 취소 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CANCELLATION_TEMPLATE_CN" \
  --sms-template-request '{
    "Body": "您预订的 {{datetime}}的预约已取消。如有疑问，请联系微信公众号。\n微信公众号：韩国江南诗丽雅皮肤科",
    "TemplateDescription": "Template for reservation cancellation notifications in Chinese"
  }'

# 태국어 예약 취소 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CANCELLATION_TEMPLATE_TH" \
  --sms-template-request '{
    "Body": "Your reservation was canceled at {{datetime}}. For inquiries, please contact us through Line or Instagram DM.\nLine ID : @pecheclinic.th\nInstagram ID : pecheclinic.th",
    "TemplateDescription": "Template for reservation cancellation notifications in Thai"
  }'

# 한국어 예약 취소 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CANCELLATION_TEMPLATE_KR" \
  --sms-template-request '{
    "Body": "고객님께서 예약하신 {{datetime}} 예약이 취소되었습니다. 문의사항은 카카오톡으로 연락주세요。\n카카오톡 ID : 세니아\nhttp://pf.kakao.com/_pmGVxj",
    "TemplateDescription": "Template for reservation cancellation notifications in Korean"
  }'

# ----------------------------------------------------------------------------------------------
# 한국어 예약 확정 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CONFIRMATION_TEMPLATE_KR" \
  --sms-template-request '{
    "Body": "고객님의 예약이 {{datetime}} [3관]으로 완료되었습니다.\n3관 오시는길: 서울특별시 서초구 강남대로69길 10 6층 세니아의원 3관",
    "TemplateDescription": "Template for reservation confirmation notifications in Korean"
  }'

# 영어 예약 확정 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CONFIRMATION_TEMPLATE_EN" \
  --sms-template-request '{
    "Body": "You are reserved at {{datetime}} [New Building].\nLocation: 6 floor, Seoho Building, 10, Gangnam-daero 69-gil, Seocho-gu, Seoul",
    "TemplateDescription": "Template for reservation confirmation notifications in English"
  }'

# 일본어 예약 확정 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CONFIRMATION_TEMPLATE_JP" \
  --sms-template-request '{
    "Body": "[予約確定ご案内] {{datetime}} [新馆]，\n新館アクセス: ソウル特別市瑞草区江南大路69キル10、6階、セニアクリニック3館",
    "TemplateDescription": "Template for reservation confirmation notifications in Japanese"
  }'

# 중국어 예약 확정 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CONFIRMATION_TEMPLATE_CN" \
  --sms-template-request '{
    "Body": "您的预约时间为{{datetime}} [本馆]，\n诗丽雅新馆地址：首尔特别市瑞草区江南大路 69路10 西湖大厦 6 层 诗丽雅医院 3 馆",
    "TemplateDescription": "Template for reservation confirmation notifications in Chinese"
  }'

# 태국어 예약 확정 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "RESERVATION_CONFIRMATION_TEMPLATE_TH" \
  --sms-template-request '{
    "Body": "You are reserved at {{datetime}} [New Building].\nLocation: ซีเนียร์คลีนิก ตึก 3ถนน 69 สายคังนัม-โร เขตซอโช กรุงโซล ตึก Seoho ชั้น 6",
    "TemplateDescription": "Template for reservation confirmation notifications in Thai"
  }'

# ----------------------------------------------------------------------------------------------
# 한국어 인증 코드 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "VERIFICATION_CODE_TEMPLATE_KR" \
  --sms-template-request '{
    "Body": "[Peche Clinic] 인증 코드: {{code}}",
    "TemplateDescription": "Template for verification code notifications in Korean"
  }'

# 영어 인증 코드 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "VERIFICATION_CODE_TEMPLATE_EN" \
  --sms-template-request '{
    "Body": "[Peche Clinic] Verification Code: {{code}}",
    "TemplateDescription": "Template for verification code notifications in English"
  }'

# 일본어 인증 코드 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "VERIFICATION_CODE_TEMPLATE_JP" \
  --sms-template-request '{
    "Body": "[Peche Clinic] 検証コード: {{code}}",
    "TemplateDescription": "Template for verification code notifications in Japanese"
  }'

# 중국어 인증 코드 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "VERIFICATION_CODE_TEMPLATE_CN" \
  --sms-template-request '{
    "Body": "[Peche Clinic] 验证码: {{code}}",
    "TemplateDescription": "Template for verification code notifications in Chinese"
  }'

# 태국어 인증 코드 템플릿
aws $profile_and_region pinpoint update-sms-template \
  --template-name "VERIFICATION_CODE_TEMPLATE_TH" \
  --sms-template-request '{
    "Body": "[Peche Clinic] รหัสยืนยัน: {{code}}",
    "TemplateDescription": "Template for verification code notifications in Thai"
  }'
