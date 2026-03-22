# Peche Backend - 운영 가이드

## 인프라 구성

```
[사용자] → [CloudFront] → [S3]          (프론트엔드/어드민)
[사용자] → [Nginx] → [Backend Docker]   (API, EC2)
                      [Redis Docker]     (캐시, EC2)
                      [RDS PostgreSQL]   (DB, 관리형)
```

- EC2: `i-0f0d7cb619e7fee74` (t3.small), EIP: `13.209.165.249`
- RDS: `peche-db-prod.c9ws0aqqwycz.ap-northeast-2.rds.amazonaws.com`
- 리전: `ap-northeast-2` (서울)

## 도메인

| 도메인 | 용도 |
|---|---|
| `pecheskin.clinic` | 프론트엔드 (S3 + CloudFront) |
| `base.pecheskin.clinic` | 백엔드 API (EC2 + Nginx) |
| `admin.pecheskin.clinic` | 어드민 (S3 + CloudFront) |

## 배포

### 백엔드

```bash
STAGE=prod make shoot
```

내부 동작: pnpm build → Docker 빌드 (linux/amd64) → ECR push → EC2에서 pull & restart

필요한 것:
- Docker Desktop 실행 중
- AWS CLI `peche` 프로파일
- SSH 키 (`~/.ssh/peche-prod-key.pem`) — 없으면 자동으로 SSM에서 다운로드

### 프론트엔드

```bash
cd peche-frontend
STAGE=prod make shoot
```

내부 동작: orval → webpack build → S3 sync → CloudFront 캐시 무효화

### 어드민

```bash
cd peche-admin
STAGE=prod make shoot
```

내부 동작: orval → webpack build → S3 sync → CloudFront 캐시 무효화

## SSH 접속

```bash
# SSH 키가 없으면 SSM에서 다운로드
aws ssm get-parameter --name "/peche/ec2/ssh-key" --with-decryption \
  --profile peche --region ap-northeast-2 \
  --query "Parameter.Value" --output text > ~/.ssh/peche-prod-key.pem
chmod 600 ~/.ssh/peche-prod-key.pem

# EC2 접속
ssh -i ~/.ssh/peche-prod-key.pem ec2-user@13.209.165.249
```

## 서버 관리 (EC2 접속 후)

```bash
cd /opt/peche

# 상태 확인
docker compose -f docker-compose.prod.yml ps

# 로그 확인
docker compose -f docker-compose.prod.yml logs -f --tail=100 backend

# 재시작
docker compose -f docker-compose.prod.yml restart backend
```

## 로컬 개발

```bash
# 방법 1: Docker 전체 (backend + postgres + redis)
make run

# 방법 2: DB만 Docker, 백엔드는 직접 실행 (핫리로드)
make local-run
```

- 로컬 백엔드: http://localhost:3007
- 로컬 DB: localhost:5440 (postgres/local_postgres)
- 로컬 Redis: localhost:6386

## 어드민 계정

어드민 사이트(`admin.pecheskin.clinic`) 로그인:

| 이메일 | 역할 |
|---|---|
| `dev.philomedi@gmail.com` | ADMIN |
| `rudalsnn@daum.net` | ADMIN |

## AWS 프로파일

모든 AWS 명령에 `--profile peche --region ap-northeast-2` 사용.
SSM Parameter Store에 환경변수, 인증 키 등 저장.
