# SSL 인증서 자동 갱신 + 만료 알림

EC2(`13.209.165.249`)의 nginx가 사용하는 Let's Encrypt 인증서를 자동 갱신하고, 임박 시 슬랙으로 알림.

## 배경 (2026-06-21 셋업)

이전엔 자동 갱신 시스템 자체가 없었음 (`certbot.timer`/`crontab` 미존재). 인증서 갱신은 누군가 수동으로 해줘야 했고, 2026-06-20 운영 인증서(`base.pecheskin.clinic`)가 만료되면서 사이트 접속 장애 발생. 긴급 갱신 + 자동화 셋업으로 동일 사고 재발 방지.

## 대상 도메인

- `base.pecheskin.clinic` — 운영 API
- `base-dev.pecheskin.clinic` — 개발 API

## 동작

### 1. 자동 갱신 — `certbot.timer`
- 매일 02:30 / 14:30 UTC (KST 11:30 / 23:30), 최대 1시간 랜덤 지연
- 만료 30일 미만일 때만 실제 갱신 (certbot 기본 동작)
- 갱신 성공 시 `--deploy-hook "systemctl reload nginx"`로 nginx 자동 reload
- `Persistent=true`로 EC2 재부팅 시 누락된 trigger 보충

### 2. 만료 임박 알림 — `cert-expiry-check.timer`
- 매일 00:00 UTC (KST 09:00), 최대 10분 랜덤 지연
- 인증서 잔여일 체크 → 14일 이하면 슬랙 알림 (`/peche/prod/base/slack/webhook-url`)
- 슬랙 알림 페이로드는 페슈 템플릿 형식 (Peche Bot, peach icon, salmon footer)
- 잔여일별 분기: 14일 이하(:bell:), 3일 이하(:fire:), 0일 이하(:rotating_light:)
- 알림 본문은 마케터도 이해 가능한 평어 (예: "운영 사이트의 보안 인증서가 N일 후 만료돼요")

## EC2 파일 위치

```
/usr/local/bin/check-cert-expiry.sh        # 만료 체크 스크립트
/etc/systemd/system/certbot.service        # 갱신 service
/etc/systemd/system/certbot.timer          # 갱신 timer
/etc/systemd/system/cert-expiry-check.service
/etc/systemd/system/cert-expiry-check.timer
/var/log/cert-expiry-check.log             # 실행 로그
```

이 디렉토리의 파일들은 EC2에 적용된 것의 사본(version control + 재구성 용도).

## 운영 명령

```bash
# 상태 확인
sudo systemctl status certbot.timer cert-expiry-check.timer
sudo systemctl list-timers certbot.timer cert-expiry-check.timer

# 최근 실행 로그
sudo journalctl -u certbot.service -n 30 --no-pager
sudo tail -20 /var/log/cert-expiry-check.log

# 강제 갱신 (운영 영향 있음)
sudo certbot renew --force-renewal
sudo systemctl reload nginx

# 인증서 잔여일 확인 (외부에서)
echo | openssl s_client -servername base.pecheskin.clinic -connect base.pecheskin.clinic:443 2>/dev/null | openssl x509 -noout -dates
```

## EC2 재구성 시 (예: 인스턴스 교체)

```bash
# 1. 위 5개 파일을 EC2의 해당 경로에 복사
sudo cp certbot.service /etc/systemd/system/
sudo cp certbot.timer /etc/systemd/system/
sudo cp check-cert-expiry.sh /usr/local/bin/
sudo cp cert-expiry-check.service /etc/systemd/system/
sudo cp cert-expiry-check.timer /etc/systemd/system/
sudo chmod +x /usr/local/bin/check-cert-expiry.sh

# 2. systemd 반영 + enable
sudo systemctl daemon-reload
sudo systemctl enable --now certbot.timer cert-expiry-check.timer

# 3. (jq 필요) 알림 스크립트가 jq 사용
sudo dnf install -y jq
```
