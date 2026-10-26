# AWS EKS 배포 가이드

## 선택한 구성

Lumine은 Kubernetes 요구를 유지하면서 운영 부담을 줄이기 위해 Amazon EKS Auto Mode를 사용한다.

- Amazon ECR: `server`, `web` Docker 이미지 저장
- Amazon EKS Auto Mode: 노드 프로비저닝, 교체, 확장, 스토리지와 로드밸런서 관리
- Application Load Balancer: `/api`, `/actuator`는 서버로, 나머지는 웹으로 라우팅
- Amazon RDS for PostgreSQL: 운영 데이터 저장
- AWS Secrets Manager: DB 비밀번호, JWT 서명 키, 선택적인 OpenAI 키 보관
- GitHub Actions OIDC: 장기 액세스 키 없이 server와 web을 독립 배포
- ACM: ALB의 HTTPS 인증서

React Native 앱은 Kubernetes에 실행하는 서비스가 아니므로 Android/iOS 아티팩트 파이프라인을 별도로 유지한다. 서명 credential과 production API URL이 준비된 release 작업이므로 `.github/workflows/mobile-artifacts.yml`은 `workflow_dispatch`로만 수동 실행한다. 앱은 EKS의 공개 HTTPS 주소를 API URL로 사용한다.

## 왜 EKS Auto Mode인가

작은 서비스만 고려하면 App Runner나 ECS Fargate가 더 저렴하고 단순하다. 하지만 Docker와 Kubernetes를 명시적인 운영 기준으로 삼는 경우 EKS Auto Mode가 일반 EKS보다 적합하다.

- Karpenter, AWS Load Balancer Controller, EBS CSI 같은 핵심 구성요소를 직접 설치·업데이트하지 않아도 된다.
- Pod 요청량을 기반으로 EC2 용량을 추가하고 유휴 노드를 통합한다.
- 표준 Kubernetes 리소스와 `kubectl`을 그대로 사용한다.
- server와 web의 배포 주기, 롤백, 리소스 제한을 분리할 수 있다.

비용은 EKS 제어 영역, Auto Mode 관리 요금, EC2, ALB, NAT Gateway, RDS, ECR, 데이터 전송을 합산한다. 트래픽이 매우 적고 Kubernetes가 필수가 아니라면 App Runner를 유지하는 편이 경제적이다.

## 저장소 구성

```text
server/Dockerfile                       Spring Boot 이미지
client/apps/web/Dockerfile              Next.js 정적 웹 + nginx 이미지
infra/aws/                              VPC, RDS, ECR, EKS Auto Mode, IAM
infra/k8s/base/                         server/web Deployment와 Service
infra/k8s/overlays/production/          ALB Ingress와 운영 설정 예시
.github/workflows/deploy.yml             server 독립 배포
.github/workflows/deploy-web.yml         web 독립 배포
```

기존 App Runner 리소스는 마이그레이션 중 서비스 중단을 피하기 위해 Terraform에 남겨 두었다. EKS 전환과 데이터 검증이 끝난 뒤 `create_apprunner_service = false`로 적용해 제거한다.

## 1. 사전 준비

로컬에 AWS CLI, Terraform 1.7 이상, Docker Buildx, `kubectl`을 설치한다. AWS 관리자 권한 프로필로 로그인하고 ACM에서 운영 도메인의 인증서를 발급·검증한다.

JWT 키가 없다면 생성한다.

```bash
aws secretsmanager create-secret \
  --region ap-northeast-2 \
  --name lumine/production/jwt \
  --secret-string "$(openssl rand -base64 48)"
```

## 2. Terraform 적용

```bash
cd infra/aws
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

`terraform.tfvars`에는 실제 Secret ARN, OAuth Client ID와 GitHub OIDC subject를 설정한다. `eks_public_access_cidrs` 기본값은 GitHub-hosted runner를 위해 전체 공개되어 있다. 자체 runner나 고정 출구 IP를 사용하면 해당 CIDR로 반드시 제한한다.

주요 출력 확인:

```bash
terraform output eks_cluster_name
terraform output ecr_repository_name
terraform output web_ecr_repository_name
terraform output github_actions_role_arn
terraform output -raw database_jdbc_url
terraform output -raw database_secret_arn
```

## 3. GitHub production 환경 설정

Environment Secret:

- `AWS_ROLE_ARN`: `terraform output -raw github_actions_role_arn`

Repository 또는 production Environment Variables:

- `AWS_REGION`: `ap-northeast-2`
- `AWS_ACCOUNT_ID`: AWS 계정 ID
- `EKS_CLUSTER_NAME`: `terraform output -raw eks_cluster_name`
- `ECR_SERVER_REPOSITORY`: `terraform output -raw ecr_repository_name`
- `ECR_WEB_REPOSITORY`: `terraform output -raw web_ecr_repository_name`
- `DB_URL`: `terraform output -raw database_jdbc_url`
- `DB_USERNAME`: 기본값 `lumine_admin`
- `DB_SECRET_ARN`: `terraform output -raw database_secret_arn`
- `JWT_SECRET_ARN`: JWT secret ARN
- `OPENAI_API_KEY_SECRET_ARN`: 선택 사항
- `GOOGLE_CLIENT_IDS`, `KAKAO_APP_IDS`, `OPENAI_MODEL`
- `ACM_CERTIFICATE_ARN`: 운영 도메인의 ACM 인증서 ARN
- `LUMINE_PUBLIC_BASE_URL`: 예: `https://lumine.example.com`
- `LUMINE_API_BASE_URL`: 모바일 빌드에서도 같은 주소 사용

서버 워크플로는 Secrets Manager의 값을 로그에 출력하지 않고 Kubernetes Secret으로 동기화한다.

## 4. 최초 배포

GitHub Actions에서 다음 순서로 수동 실행한다.

1. `Deploy server to Amazon EKS`
2. `Deploy web to Amazon EKS`

웹 배포가 끝나면 ALB 주소를 확인한다.

```bash
aws eks update-kubeconfig --name lumine-production-eks --region ap-northeast-2
kubectl -n lumine get ingress lumine
```

Route 53에서 운영 도메인을 출력된 ALB로 Alias 연결한다. DNS 적용 후 다음을 확인한다.

```bash
curl https://lumine.example.com/actuator/health
curl -I https://lumine.example.com/
kubectl -n lumine get pods,deployments,services,ingress
```

## 5. 이후 배포와 롤백

- `server/**` 변경: 서버 테스트 → 서버 이미지 빌드 → ECR push → 서버 Deployment 롤링 업데이트
- `client/apps/web/**` 또는 `client/packages/domain/**` 변경: 웹 검사 → 웹 이미지 빌드 → ECR push → 웹 Deployment 롤링 업데이트
- 앱은 Android/iOS 아티팩트 워크플로를 필요할 때 수동 실행해 별도 관리

이미지는 Git commit SHA와 workflow 재시도 번호를 결합한 불변 태그를 사용한다. 롤백할 때 이전 이미지 태그를 지정한다.

```bash
kubectl -n lumine set image deployment/lumine-server \
  server=ACCOUNT.dkr.ecr.ap-northeast-2.amazonaws.com/lumine-production-server:PREVIOUS_SHA

kubectl -n lumine set image deployment/lumine-web \
  web=ACCOUNT.dkr.ecr.ap-northeast-2.amazonaws.com/lumine-production-web:PREVIOUS_SHA
```

## 운영 체크리스트

- 운영 전 `eks_public_access_cidrs`를 고정 IP 또는 자체 runner CIDR로 제한
- RDS 삭제 방지와 백업 복원 훈련 유지
- ACM 인증서와 Route 53 Alias 연결
- CloudWatch Container Insights 또는 OpenTelemetry 기반 관측성 추가
- AWS Budgets로 EKS, EC2, NAT Gateway, ALB, RDS 예산 알림 설정
- 안정화 후 App Runner 리소스 제거
- 부하 패턴을 확인한 뒤 HPA와 최소 replica 수 조정

## 공식 참고

- [EKS Auto Mode](https://docs.aws.amazon.com/eks/latest/userguide/automode.html)
- [EKS Auto Mode ALB Ingress](https://docs.aws.amazon.com/eks/latest/userguide/auto-configure-alb.html)
- [EKS Auto Mode IAM](https://docs.aws.amazon.com/eks/latest/userguide/auto-learn-iam.html)
- [Amazon EKS 요금](https://aws.amazon.com/eks/pricing/)
