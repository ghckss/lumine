# Lumine 인프라 작업 문서

## 0. 범위
- 대상: `web/`, `server/`, `app/`
- 클라우드: `AWS`
- 컨테이너 운영: `Kubernetes`
- 컨테이너 레지스트리: `ECR`
- 웹 런타임: `Next.js 서버 런타임`
- API 런타임: `Spring Boot`
- DB: `RDS PostgreSQL`

## 1. 도메인 작업
- `web.lumine.kr` 도메인을 준비해요.
- `api.lumine.kr` 도메인을 준비해요.
- `Route 53` hosted zone을 구성해요.
- `CloudFront` alias record를 연결해요.
- `ACM` 인증서를 발급하고 연결해요.

## 2. 웹 배포 작업
- `web/`용 Dockerfile을 만들어요.
- `Next.js standalone output` 기준으로 이미지를 빌드해요.
- 정적 asset 업로드 경로를 분리해요.
  - `/_next/static/*`
  - public asset
- 정적 asset은 `S3`에 업로드해요.
- 웹 서버 이미지는 `ECR`에 푸시해요.
- `EKS`에 `web` Deployment를 만들어요.
- `web` Service를 만들어요.
- `web` Ingress를 만들어요.
- `web` health endpoint를 만들어요.
  - `/health`
- `web` readiness/liveness probe를 설정해요.
- `web` HPA를 설정해요.

## 3. API 배포 작업
- `server/`용 Dockerfile을 만들어요.
- Spring Boot 이미지를 빌드해요.
- API 이미지는 `ECR`에 푸시해요.
- `EKS`에 `server` Deployment를 만들어요.
- `server` Service를 만들어요.
- `server` Ingress를 만들어요.
- `server` health endpoint를 확인해요.
  - `/actuator/health`
- `server` readiness/liveness probe를 설정해요.
- `server` HPA를 설정해요.

## 4. Kubernetes 작업
- `EKS` 클러스터를 만들어요.
- 환경별 클러스터를 분리해요.
  - `stage`
  - `prod`
- namespace를 분리해요.
  - `web`
  - `server`
- `AWS Load Balancer Controller`를 설치해요.
- `metrics-server`를 설치해요.
- `ConfigMap` 관리 기준을 정해요.
- `Secret` 주입 방식을 정해요.
- `IRSA`를 구성해요.

## 5. 네트워크 작업
- `stage VPC`를 만들어요.
- `prod VPC`를 만들어요.
- Public subnet을 만들어요.
- Private app subnet을 만들어요.
- Private data subnet을 만들어요.
- 인터넷 공개는 `ALB`만 허용해요.
- `web`, `server` 워크로드는 private subnet에 배치해요.
- `RDS`, `Redis`는 private subnet에 배치해요.
- security group을 분리해요.
  - ALB
  - EKS workload
  - RDS
  - Redis

## 6. 데이터 계층 작업
- `RDS PostgreSQL` 인스턴스를 만들어요.
- 운영은 `Multi-AZ`로 구성해요.
- `stage`는 단일 AZ 허용 여부를 결정해요.
- DB 백업 보존 기간을 설정해요.
- DB 파라미터 그룹을 관리해요.
- 연결 정보는 `Secrets Manager`로 분리해요.
- 필요 시 `Redis`를 추가해요.
- 필요 시 `SQS`를 추가해요.

## 7. 엣지와 캐시 작업
- `CloudFront` distribution을 만들어요.
- `WAF`를 연결해요.
- origin을 분리해요.
  - web origin
  - api origin
  - static asset origin
- 캐시 정책을 분리해요.
  - HTML
  - static asset
  - API
- `/_next/static/*`는 긴 TTL로 설정해요.
- API는 캐시하지 않도록 설정해요.

## 8. 보안 작업
- `WAF` 기본 규칙을 적용해요.
  - AWS managed rules
  - rate limit
  - IP reputation
- 외부 트래픽은 HTTPS only로 강제해요.
- OAuth secret, DB secret, signing key는 `Secrets Manager`에 저장해요.
- 일반 환경 변수는 `Parameter Store`에 저장해요.
- Kubernetes에 평문 secret을 직접 커밋하지 않아요.

## 9. 운영 작업
- `CloudWatch Logs` 수집을 설정해요.
- `Container Insights`를 활성화해요.
- 접근 로그 보관용 `S3` 버킷을 만들어요.
- 알람을 설정해요.
  - ALB 5xx
  - CloudFront 5xx
  - Pod CPU/Memory
  - RDS CPU/Storage/Connections
- 배포 이력과 롤백 기준을 정해요.

## 10. CI/CD 작업
- `web` 이미지 빌드 파이프라인을 만들어요.
- `server` 이미지 빌드 파이프라인을 만들어요.
- `ECR` 푸시 파이프라인을 만들어요.
- `EKS` 배포 파이프라인을 만들어요.
- `S3` static asset 업로드 파이프라인을 만들어요.
- `CloudFront` invalidation 전략을 정해요.
- `stage -> prod` 승격 절차를 정해요.

## 11. 환경별 목표 상태
### 11.1 stage
- `web` replica 1 이상
- `server` replica 1 이상
- `RDS` 단일 AZ 허용 가능
- 운영 구조와 동일한 배포 경로 유지

### 11.2 prod
- `web` replica 2 이상
- `server` replica 2 이상
- `RDS` Multi-AZ
- `CloudFront + WAF` 필수
- ALB, EKS, DB 모두 이중화 기준 적용

## 12. 구현 기준
- `web`은 `S3 정적 사이트`로 운영하지 않아요.
- `web`은 `Next.js 서버 런타임`으로 운영해요.
- `web`, `server`는 둘 다 `Docker + EKS` 기준으로 배포해요.
- 앱 `WebView`는 `web.lumine.kr`를 바라보게 해요.
- 앱 API 호출은 `api.lumine.kr`를 바라보게 해요.
- 인프라 변경은 수동 콘솔 작업보다 IaC 기준으로 관리해요.

## 참고
- CloudFront origin / custom origin / origin path:
  - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesOrigin.html
- Route 53 -> CloudFront alias:
  - https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-to-cloudfront-distribution.html
- Amazon EKS:
  - https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html
- AWS Load Balancer Controller:
  - https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html
- RDS PostgreSQL:
  - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html
- RDS Multi-AZ:
  - https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html
- Systems Manager Parameter Store:
  - https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html
- AWS WAF with CloudFront:
  - https://docs.aws.amazon.com/waf/latest/developerguide/cloudfront-features.html
