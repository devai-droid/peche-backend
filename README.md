# peche-backend

## 기술 스택

- NestJS (TypeScript)
- PostgreSQL
- Redis
- Docker
- AWS (ECR, ECS)

## 시작하기

### 사전 요구사항

- Node.js
- pnpm
- Docker
- AWS CLI (배포 시 필요)

### 초기 설정

```bash
make init
```

이 명령어는 다음 작업을 수행합니다:

- pnpm 전역 설치
- 프로젝트 의존성 설치
- Docker 컨테이너 초기화

## 개발 환경 실행

### 데이터베이스 실행

```bash
make run-db
```

PostgreSQL과 Redis 컨테이너를 실행합니다.

### 로컬 개발 서버 실행

```bash
make local-run
```

로컬 환경에서 개발 서버를 실행합니다.

### Docker 환경에서 실행

```bash
make run
```

## 데이터베이스 마이그레이션

### 마이그레이션 생성

```bash
make mig-gen mname=MigrationName
```

### 마이그레이션 실행

```bash
make mig-run
```

### 마이그레이션 되돌리기

```bash
make mig-revert
```

## 배포

### ECR 로그인

```bash
make login-ecr
```

### 이미지 빌드 및 푸시

```bash
make build
```

### ECS 서비스 배포

```bash
make deploy
```

### 빌드 및 배포 한번에 실행

```bash
make shoot
```

### swagger URL

- <https://base-dev.pecheskin.clinic/api/docs>
- <https://base.pecheskin.clinic/api/docs>

## 모니터링

### 작업 목록 확인

```bash
make task-list
```

### 로그 확인

```bash
make log
```

## 환경 변수

- `STAGE`: 배포 환경 (기본값: dev)
- `SERVICE_PORT`: 서비스 포트 (기본값: 3007)
- `DB_HOST`: 데이터베이스 호스트
- `DB_PORT`: 데이터베이스 포트
- `DB_USER`: 데이터베이스 사용자
- `DB_PW`: 데이터베이스 비밀번호
- `REDIS_HOST`: Redis 호스트
- `REDIS_PORT`: Redis 포트
