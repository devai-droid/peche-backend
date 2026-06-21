#!/bin/bash
# 인증서 만료 임박 시 페슈 슬랙 알림 (마케터도 이해 가능한 문구)
set -euo pipefail

WEBHOOK=$(aws ssm get-parameter --name "/peche/prod/base/slack/webhook-url" \
  --with-decryption --region ap-northeast-2 \
  --query "Parameter.Value" --output text 2>/dev/null)

THRESHOLD_DAYS=14
LOG=/var/log/cert-expiry-check.log
exec >> "$LOG" 2>&1
echo "--- $(date -Iseconds) ---"

send_slack() {
  local TEXT="$1"
  local DATE=$(date "+%Y-%m-%d %H:%M")
  local PAYLOAD=$(jq -n \
    --arg text "$TEXT" \
    --arg footer "pecheskin.clinic | $DATE" \
    '{text: $text, username: "Peche Bot", icon_emoji: ":peach:", attachments: [{footer: $footer, color: "#BD7B60"}]}')
  curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$WEBHOOK" > /dev/null
}

for DOMAIN in base.pecheskin.clinic base-dev.pecheskin.clinic; do
  CERT_FILE="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
  [ -f "$CERT_FILE" ] || { echo "skip: $DOMAIN (no cert)"; continue; }

  EXPIRY_EPOCH=$(date -d "$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)" +%s)
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
  echo "$DOMAIN: $DAYS_LEFT days left"

  if [ "$DAYS_LEFT" -gt "$THRESHOLD_DAYS" ]; then continue; fi

  if [ "$DOMAIN" = "base.pecheskin.clinic" ]; then
    SITE_LABEL="*운영 사이트* (예약·회원·시술 정보 처리 서버)"
  else
    SITE_LABEL="*개발 서버* (테스트용)"
  fi

  if [ "$DAYS_LEFT" -le 0 ]; then
    TEXT=$(printf ":rotating_light: *사이트가 멈췄어요!*\n\n%s의 보안 인증서가 *만료*됐어요.\n고객이 사이트에 접속하면 \"안전하지 않음\" 경고가 뜨고 예약·결제가 안 됩니다.\n\n*지금 즉시 개발팀에 연락해주세요.*\n\n_(만료: %d일 지남 / 대상: %s)_" \
      "$SITE_LABEL" $((-DAYS_LEFT)) "$DOMAIN")
  elif [ "$DAYS_LEFT" -le 3 ]; then
    TEXT=$(printf ":fire: *긴급 — 곧 사이트가 멈출 수 있어요*\n\n%s의 보안 인증서가 *%d일 후 만료*됩니다.\n자동 갱신이 작동하지 않은 것 같아요. 그대로 두면 고객이 사이트에 접속할 수 없게 돼요.\n\n*지금 개발팀에 알려주세요.*\n\n_(대상: %s)_" \
      "$SITE_LABEL" "$DAYS_LEFT" "$DOMAIN")
  else
    TEXT=$(printf ":bell: *사이트 보안 인증서 만료 임박 안내*\n\n%s의 보안 인증서가 *%d일 후 만료*돼요.\n자동 갱신이 안 된 것 같으니 개발팀에 한 번 확인 요청 주세요. 만료 전이면 사이트엔 아직 영향 없어요.\n\n_(대상: %s)_" \
      "$SITE_LABEL" "$DAYS_LEFT" "$DOMAIN")
  fi
  send_slack "$TEXT" && echo "alerted: $DOMAIN"
done
