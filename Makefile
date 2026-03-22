.PHONY: init clean login-ecr build deploy run down mig test-watch test mig-gen mig-run mig-revert

STAGE ?= dev
SERVICE_PORT ?= 3007
REDIS_HOST ?= redis
REDIS_PORT ?= 6386
DB_HOST ?= localhost
DB_PORT ?= 5440
DB_USER ?= postgres
DB_NAME ?= postgres
DB_PW ?= local_postgres
SERVICE_NAME ?= peche
API_NAME ?= base
SCHEDULER ?= 0
AWS_REGION=ap-northeast-2
AWS_PROFILE_OPT ?= --profile peche --region $(AWS_REGION)
AWS_USER_ID ?= $(shell aws $(AWS_PROFILE_OPT) sts get-caller-identity --query Account --output text)

ECR_REGISTRY = $(AWS_USER_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
ECR_REPOSITORY = $(ECR_REGISTRY)/$(SERVICE_NAME)-api

# EC2 배포 설정 (dev 전용)
EC2_HOST ?= 13.209.165.249
EC2_USER ?= ec2-user
EC2_KEY ?= ~/.ssh/peche-prod-key.pem

# ECS 배포 설정 (prod 전용)
ECS_CLUSTER_NAME ?= $(shell aws $(AWS_PROFILE_OPT) ssm get-parameter --name \
	"/$(SERVICE_NAME)/$(STAGE)/$(API_NAME)/ecs/cluster" | jq '.Parameter | .Value')
ECS_SERVICE_NAME ?= $(shell aws $(AWS_PROFILE_OPT) ssm get-parameter --name \
	"/$(SERVICE_NAME)/$(STAGE)/$(API_NAME)/ecs/service" | jq '.Parameter | .Value')


login-ecr:
	@aws $(AWS_PROFILE_OPT) ecr get-login-password | docker login --username AWS --password-stdin "$(ECR_REGISTRY)"

build: login-ecr clean
	pnpm build
	docker buildx build --platform linux/amd64 --load -t $(ECR_REPOSITORY):$(STAGE) .
	docker push $(ECR_REPOSITORY):$(STAGE)

ensure-ssh-key:
	@test -f $(EC2_KEY) || (echo "SSH key not found. Downloading from SSM..." && \
		aws $(AWS_PROFILE_OPT) ssm get-parameter --name "/peche/ec2/ssh-key" --with-decryption --query "Parameter.Value" --output text > $(EC2_KEY) && \
		chmod 600 $(EC2_KEY) && \
		echo "SSH key saved to $(EC2_KEY)")

deploy: ensure-ssh-key
	ssh -i $(EC2_KEY) $(EC2_USER)@$(EC2_HOST) '\
		aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin $(ECR_REGISTRY) && \
		cd /opt/peche && \
		TAG=$(STAGE) docker compose -f docker-compose.prod.yml pull backend && \
		TAG=$(STAGE) docker compose -f docker-compose.prod.yml up -d --no-deps backend && \
		docker image prune -f'

init:
	npm install -g pnpm
	pnpm install
	docker compose rm -f backend
	@PORT=$(SERVICE_PORT) \
	DB_USER=$(DB_USER) \
	DB_PW=$(DB_PW) \
	STAGE=$(STAGE) \
	SCHEDULER=$(SCHEDULER) \
		docker compose build backend

clean:
	@rm -rf ./dist

run-db:
	docker compose up -d postgres redis

run: clean run-db
	@PORT=$(SERVICE_PORT) \
	DB_USER=$(DB_USER) \
	DB_PW=$(DB_PW) \
	DB_NAME=$(DB_NAME) \
	STAGE=$(STAGE) \
	SCHEDULER=$(SCHEDULER) \
		docker compose up backend

local-run: clean run-db
	@PORT=$(SERVICE_PORT) \
	DB_HOST=$(DB_HOST) \
	DB_PORT=$(DB_PORT) \
	DB_USER=$(DB_USER) \
	DB_PW=$(DB_PW) \
	DB_NAME=$(DB_NAME) \
	REDIS_HOST=$(REDIS_HOST) \
	REDIS_PORT=$(REDIS_PORT) \
	STAGE=$(STAGE) \
	IS_LOCAL_ENV=1 \
	SCHEDULER=$(SCHEDULER) \
		pnpm start:dev

down: clean
	@docker compose down

test-watch:
	@pnpm test:watch

test:
	@pnpm test

mig-gen: clean run-db
	@pnpm build
	@DB_HOST=$(DB_HOST) \
	DB_PORT=$(DB_PORT) \
	DB_USER=$(DB_USER) \
	DB_NAME=$(DB_NAME) \
	DB_PW=$(DB_PW) \
	IS_LOCAL_ENV=1 \
		pnpm migration:generate src/migrations/$(mname)

mig-run: clean run-db
	@pnpm build
	@DB_HOST=$(DB_HOST) \
	DB_PORT=$(DB_PORT) \
	DB_USER=$(DB_USER) \
	DB_NAME=$(DB_NAME) \
	DB_PW=$(DB_PW) \
	IS_LOCAL_ENV=1 \
		pnpm migration:run

mig-revert: clean run-db
	@pnpm build
	@DB_HOST=$(DB_HOST) \
	DB_PORT=$(DB_PORT) \
	DB_USER=$(DB_USER) \
	DB_NAME=$(DB_NAME) \
	DB_PW=$(DB_PW) \
	IS_LOCAL_ENV=1 \
		pnpm migration:revert

shoot: build deploy

task-list:
	aws $(AWS_PROFILE_OPT) ecs list-tasks --cluster $(ECS_CLUSTER_NAME)

log:
	aws $(AWS_PROFILE_OPT) logs tail --format short --since 1h --follow  /$(SERVICE_NAME)/$(STAGE)/base-log
