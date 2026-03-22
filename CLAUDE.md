# Peche Backend - Claude 참고 정보

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

- 백엔드: `STAGE=prod make shoot` (Docker Desktop 필요, SSH 키 자동 다운로드)
- 프론트엔드: `cd peche-frontend && STAGE=prod make shoot`
- 어드민: `cd peche-admin && STAGE=prod make shoot`

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
docker compose -f docker-compose.prod.yml ps          # 상태
docker compose -f docker-compose.prod.yml logs -f --tail=100 backend  # 로그
docker compose -f docker-compose.prod.yml restart backend  # 재시작
```

## 로컬 개발

- `make run` — Docker 전체 (backend + postgres + redis), http://localhost:3007
- `make local-run` — DB만 Docker, 백엔드 핫리로드
- 로컬 DB: localhost:5440 (postgres/local_postgres), Redis: localhost:6386

## 어드민 계정

| 이메일 | 역할 |
|---|---|
| `dev.philomedi@gmail.com` | ADMIN |
| `rudalsnn@daum.net` | ADMIN |

<!-- sync-docs:start -->

## 기술 스택

- NestJS 10, TypeScript 4.9, Node 20
- TypeORM 0.3 + PostgreSQL 14 (SnakeNamingStrategy)
- Bull + Redis 7 (큐/캐시)
- AWS SDK v3 (S3, SES, SNS, SSM, CloudFront, Pinpoint, SQS)
- Swagger (`@nestjs/swagger@11`), i18n (`nestjs-i18n@10`)
- 패키지 매니저: pnpm 8

## 아키텍처

```
src/
├── admin/          # 어드민 인증/유저
├── auth/           # 인증 (카카오, 이메일, 전화)
├── blog/           # 블로그 글/카테고리
├── config/         # 환경설정 (DB, Auth, ORM)
├── doctor-palette/ # Doctor Palette 웹훅
├── event/          # 시술 이벤트/번들
├── file/           # S3 파일 업로드/처리 (Bull queue)
├── health/         # 헬스체크
├── message/        # SMS, 이메일, 카카오 알림톡
├── migrations/     # TypeORM 마이그레이션 (40+)
├── product/        # 시술 상품/카테고리
├── reservation/    # 예약 (슬롯, 스케줄러)
├── shared/         # 공유 유틸 (아래 상세)
├── smart-doctor/   # Smart Doctor CRM 연동
├── system/         # 시스템 설정, 인기 상품
├── upload/         # 파일 업로드 서비스
├── users/          # 사용자 계정
├── app.module.ts
└── main.ts
```

## 코딩 규칙

- 임포트: `@root/*` 별칭 사용 (tsconfig paths)
- 파일명: `*.service.ts`, `*.controller.ts`, `*.entity.ts`, `*.dto.ts`, `*.module.ts`
- 변수: camelCase, 클래스/타입: PascalCase, 상수: CONSTANT_CASE
- 에러: NestJS 내장 예외 (`BadRequestException`, `NotFoundException` 등) + i18n 메시지
- 타입: enum 적극 사용 (`UserStatus`, `Role`, `ReservationStatus`, `LanguageLocale`)
- 엔티티: `TimeStampEntity` 상속, `@Exclude()` 데코레이터로 민감 필드 제외
- 커밋: `feat:`, `fix:`, `chore:` 접두사, 한국어/영어 혼용
- 페이지네이션: `Pagination<T>` 유틸 사용

## 금지사항

- `src/shared/` 외부에서 직접 DB 쿼리 작성 금지 — 서비스 레이어 사용
- TypeORM 마이그레이션은 반드시 `mig-gen` 명령으로 생성
- `IS_LOCAL_ENV=1` 없이 로컬에서 AWS SSM 접근 불가

## 주요 결합

- `shared/enum/` (UserStatus, Role, AuthProvider, LanguageLocale, ReservationStatus) → 전 모듈에서 사용
- `shared/entity/time-stamp.entity.ts` → 모든 도메인 엔티티의 베이스 클래스
- `shared/helper/aws.helper.ts` → auth, upload, message, health 모듈에서 SSM/SES/SNS 호출
- `shared/pagination/` → 모든 목록 API에서 사용
- `UsersModule ↔ AuthModule` (forwardRef 순환 의존)
- `ReservationModule → ProductModule, EventModule, SmartDoctorModule`

## API & 데이터

- 글로벌 프리픽스: `/api`, Swagger: `/api/docs`
- Validation pipe: `forbidNonWhitelisted: true`, `transform: true`
- Body 제한: 50MB, Helmet 활성화, CORS 활성화
- 마이그레이션 자동 실행 (`migrationsRun: true`)
- SSL: `rejectUnauthorized: false` (AWS RDS)

## 제약사항

- `STAGE` 환경변수로 dev/prod 구분 — SSM 파라미터 경로가 달라짐
- Docker 빌드: `linux/amd64` 플랫폼 고정 (EC2용)
- Redis는 EC2 Docker 컨테이너 (ElastiCache 삭제됨)
- 포트: 백엔드 3000 (내부), 3007 (로컬 매핑)

<!-- sync-docs:end -->
