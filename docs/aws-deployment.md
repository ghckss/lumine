# AWS 서버 배포 가이드

## 구성

- Amazon ECR: Spring Boot 컨테이너 이미지 저장
- AWS App Runner: 공개 HTTPS API 실행, 헬스체크와 자동 확장
- Amazon RDS for PostgreSQL: 사용자별 일기와 마음 확인 데이터 저장
- VPC: App Runner와 RDS를 프라이빗 서브넷에 배치
- NAT Gateway: 서버가 Google, Kakao, OpenAI 공개 API에 접근할 수 있도록 제공
- AWS Secrets Manager: DB 비밀번호, JWT 서명 키, 선택적인 OpenAI 키 관리
- GitHub Actions OIDC: 장기 AWS 액세스 키 없이 배포

인프라 정의는 `infra/aws`에 있다. 기본 리전은 서울 `ap-northeast-2`이며, App Runner가 제공하는 HTTPS 주소를 바로 사용할 수 있다.

## 사전 준비

로컬에 AWS CLI, Terraform 1.7 이상, Docker Buildx를 설치하고 AWS 관리자 권한이 있는 프로필로 로그인한다.

JWT 서명 키를 Secrets Manager에 먼저 만든다.

```bash
aws secretsmanager create-secret \
  --region ap-northeast-2 \
  --name lumine/production/jwt \
  --secret-string "$(openssl rand -base64 48)"
```

OpenAI 생성을 사용할 경우 API 키도 별도 secret string으로 만든다. 생략하면 서버의 규칙 기반 문장이 사용된다.

```bash
aws secretsmanager create-secret \
  --region ap-northeast-2 \
  --name lumine/production/openai \
  --secret-string "YOUR_OPENAI_API_KEY"
```

## 1. 기본 인프라 생성

```bash
cd infra/aws
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

`terraform.tfvars`에서 다음 값을 실제 환경에 맞게 변경한다.

- `jwt_secret_arn`: 앞에서 만든 JWT secret ARN
- `google_client_ids`: 서버가 허용할 Google OAuth 클라이언트 ID 목록
- `kakao_app_ids`: 서버가 허용할 숫자형 Kakao 앱 ID 목록
- `github_oidc_subject`: GitHub의 실제 OIDC `sub` 클레임
- `github_oidc_provider_arn`: AWS 계정에 GitHub OIDC 공급자가 이미 있을 때만 지정
- `openai_api_key_secret_arn`: OpenAI 사용 시에만 지정

최초 적용에서는 `create_apprunner_service = false`를 유지한다. App Runner는 시작할 이미지가 ECR에 먼저 존재해야 하기 때문이다.

GitHub `production` Environment를 사용하는 기본 OIDC subject는 `repo:ghckss/lumine:environment:production`이다. 2026년 7월 이후 생성되었거나 이름이 변경된 저장소는 조직·저장소 숫자 ID가 포함된 불변 subject를 사용할 수 있으므로 실제 토큰 클레임과 반드시 대조한다.

## 2. 최초 이미지 업로드

```bash
cd infra/aws
ECR_URL="$(terraform output -raw ecr_repository_url)"
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
AWS_REGION="ap-northeast-2"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

docker buildx build \
  --platform linux/amd64 \
  --tag "${ECR_URL}:latest" \
  --push \
  ../../server
```

## 3. App Runner 생성

`terraform.tfvars`에서 다음 값을 바꾸고 다시 적용한다.

```hcl
create_apprunner_service = true
```

```bash
terraform plan
terraform apply
terraform output
```

`api_base_url`이 모바일 앱에서 사용할 HTTPS 주소다. 배포 후 아래 URL이 `UP`을 반환하는지 확인한다.

```bash
curl "$(terraform output -raw api_base_url)/actuator/health"
```

## 4. GitHub 설정

GitHub 저장소에 `production` Environment를 만든다. Environment 보호 규칙을 켜면 승인 후에만 운영 배포되도록 설정할 수 있다.

Repository Variables:

- `AWS_REGION`: `ap-northeast-2`
- `AWS_ACCOUNT_ID`: AWS 계정 ID
- `ECR_SERVER_REPOSITORY`: `terraform output -raw ecr_repository_name`
- `AWS_APPRUNNER_SERVICE_ARN`: `terraform output -raw apprunner_service_arn`
- `LUMINE_API_BASE_URL`: `terraform output -raw api_base_url`

Environment Secret:

- `AWS_ROLE_ARN`: `terraform output -raw github_actions_role_arn`

`master` 브랜치에서 `server/**` 또는 배포 워크플로가 변경되면 다음 순서로 자동 배포된다.

1. 서버 테스트
2. OIDC 단기 자격 증명 발급
3. Docker 이미지 빌드 및 ECR 업로드
4. App Runner 배포 시작
5. 배포 완료 또는 롤백 상태 확인

필요하면 GitHub Actions 화면에서 `Deploy server to AWS`를 수동 실행할 수 있다.

## 5. 모바일 앱 연결

개발 빌드는 환경변수가 없으면 로컬 서버를 사용한다. 스토어 빌드는 Repository Variable `LUMINE_API_BASE_URL`을 번들에 포함하며, 값이 HTTPS 주소가 아니면 GitHub Actions가 빌드를 중단한다. App Runner 생성 후 `terraform output -raw api_base_url` 값을 등록하고 실제 기기에서 로그인·기록 저장을 확인한다.

## 운영 주의사항

- RDS는 외부 공개를 차단하고 App Runner 보안 그룹에서만 5432 포트 접근을 허용한다.
- DB 마스터 비밀번호는 RDS가 Secrets Manager에서 생성·관리한다.
- 운영 DB는 기본적으로 삭제 방지가 켜져 있다.
- JWT 및 OpenAI 비밀값은 GitHub에 원문으로 저장하지 않는다.
- NAT Gateway는 이 구성의 주요 고정 비용이다. Google·Kakao·OpenAI 호출 때문에 공개 인터넷 송신 경로가 필요하다.
- 초기 비용을 낮추기 위해 NAT Gateway와 RDS는 단일 인스턴스로 구성했다. 높은 가용성이 필요해지면 AZ별 NAT Gateway와 RDS Multi-AZ를 적용한다.
- Terraform 상태에는 인프라 식별 정보가 포함되므로 팀 운영 전 S3 원격 상태와 잠금 구성을 추가한다.
- 비용 알림, RDS 스냅샷 복원 훈련, App Runner 로그 보존 기간, 커스텀 도메인 연결은 실제 출시 전에 별도로 설정한다.

## 공식 참고 문서

- [GitHub Actions에서 AWS OIDC 구성](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)
- [App Runner VPC 송신 및 NAT 구성](https://docs.aws.amazon.com/apprunner/latest/dg/network-vpc.html)
- [App Runner 환경변수와 Secrets Manager 연동](https://docs.aws.amazon.com/apprunner/latest/dg/env-variable-manage.html)
- [App Runner 수동 배포 시작](https://docs.aws.amazon.com/cli/latest/reference/apprunner/start-deployment.html)
- [RDS 비밀번호의 Secrets Manager 관리](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-secrets-manager.html)
