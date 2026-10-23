# Lumine

**Lumis eterne — 당신의 영원한 빛**

Lumine은 감정을 기록하고 마음의 흐름을 돌아볼 수 있게 돕는 서비스입니다. 감정 일기, 마음 상태 확인, 기간별 리포트와 안전 도움 동선을 제공하며 의료적 진단을 대신하지 않습니다.

## 서비스 구성

- [`server/`](server/): Spring Boot 3·Kotlin 기반 API입니다. JWT 인증, 사용자별 일기와 마음 확인 결과, 게스트 기록 이전, 데이터 내보내기·삭제를 담당합니다.
- [`client/apps/app/`](client/apps/app/): React Native 0.76 기반 Android/iOS 앱입니다. 네이티브 소셜 로그인, 기기 캐시와 오프라인 동기화를 포함한 전체 사용자 경험을 제공합니다.
- [`client/apps/web/`](client/apps/web/): Next.js 16 App Router 기반 웹 앱입니다. 정적 export로 빌드하며 브라우저 저장소와 Lumine API를 사용합니다.
- [`client/packages/`](client/packages/): app과 web이 공유하는 플랫폼 독립 도메인 규칙과 API 계약입니다.

각 서비스는 독립적으로 빌드·검증합니다. 클라이언트 앱끼리 source를 직접 가져오지 않으며, 공통 코드만 `client/packages`에서 공개 package로 제공합니다.

## 저장소 구조

```text
lumine/
├── server/                  # Spring Boot API
├── client/
│   ├── apps/app/            # React Native Android/iOS 앱
│   ├── apps/web/            # Next.js 웹 앱
│   └── packages/            # domain, api-contracts
├── infra/                   # Terraform AWS와 Kubernetes manifests
├── scripts/                 # 개발, artifact, 배포 진입점
└── docs/                    # 배포·현재 기능·향후 기획 문서
```

세부 안내:

- [서버 설정과 실행](server/)
- [클라이언트 워크스페이스](client/)
- [모바일 앱 설정과 실행](client/apps/app/)
- [웹 앱](client/apps/web/)
- [AWS EKS 배포 가이드](docs/aws-deployment.md)

## 사전 준비와 설치

공통 클라이언트 도구는 Node.js 22와 Corepack을 권장하며, 저장소는 pnpm 11.11.0을 사용합니다.

```bash
corepack enable
pnpm --dir client install --frozen-lockfile
```

서버에는 Java 17이 필요합니다. 루트 서버 실행 script는 Gradle 8.10.2를 `/tmp`에 준비하며, 직접 Gradle 명령을 사용할 때는 Gradle 8.x가 필요합니다. 모바일 실행에는 플랫폼에 따라 Xcode/CocoaPods 또는 Android Studio/SDK가 추가로 필요합니다.

## 개발 시작

서버와 Metro를 시작한 뒤 iOS와 Android를 차례로 실행하려면 다음 명령을 사용합니다. 두 네이티브 toolchain과 simulator/emulator가 모두 준비되어 있어야 합니다.

```bash
pnpm run dev:all
```

서버, 웹, Metro 또는 각 플랫폼은 아래 script로 따로 실행할 수 있습니다.

## 루트 scripts

루트에서 `pnpm run <script>` 형식으로 실행합니다.

| Script | 명령 | 목적 |
| --- | --- | --- |
| `dev:server` | `pnpm run dev:server` | 환경 파일을 읽고 로컬 Spring Boot API를 `8080` 포트에서 실행합니다. |
| `dev:client` | `pnpm run dev:client` | Turborepo로 client workspace의 개발 task를 병렬 실행합니다. 현재 Metro와 web dev server가 대상입니다. |
| `dev:metro` | `pnpm run dev:metro` | React Native Metro bundler를 실행합니다. |
| `dev:web` | `pnpm run dev:web` | Next.js 개발 서버를 `127.0.0.1:4173`에서 실행합니다. |
| `build:web` | `pnpm run build:web` | web workspace의 production static export를 생성합니다. |
| `check:client` | `pnpm run check:client` | client workspace의 typecheck, lint, test task를 실행합니다. |
| `dev:ios` | `pnpm run dev:ios` | 이미 실행 중인 Metro를 사용해 `iPhone 17 Pro` simulator에서 iOS 앱을 실행합니다. |
| `dev:android` | `pnpm run dev:android` | 이미 실행 중인 Metro를 사용해 Android 앱을 실행합니다. |
| `dev:all` | `pnpm run dev:all` | 서버와 Metro를 시작하고 준비 확인 후 iOS와 Android 앱을 차례로 실행합니다. |
| `deploy:server` | `pnpm run deploy:server` | server 이미지를 ECR에 push하고 Amazon EKS의 server Deployment를 갱신합니다. |
| `deploy:web` | `pnpm run deploy:web` | web 이미지를 ECR에 push하고 Amazon EKS의 web Deployment와 ALB Ingress를 갱신합니다. |
| `deploy:all` | `pnpm run deploy:all` | server와 web 배포 script를 순서대로 실행합니다. |
| `artifact:android` | `pnpm run artifact:android` | Android release App Bundle(AAB)을 생성합니다. |
| `artifact:ios` | `pnpm run artifact:ios` | Xcode release archive를 생성합니다. |
| `artifact:app` | `pnpm run artifact:app` | Android AAB와 iOS archive를 순서대로 생성합니다. |

`deploy:*`는 AWS, Docker Buildx, `kubectl`, 운영 환경변수와 권한을 요구하고 실제 운영 환경을 변경합니다. `artifact:*`의 배포용 결과에는 별도의 signing credential이 필요합니다. 자세한 준비 사항은 각 서비스 안내와 [배포 가이드](docs/aws-deployment.md)를 확인하세요.

## 검증

클라이언트 전체 검사는 다음 명령으로 실행합니다.

```bash
pnpm run check:client
```

서버는 Java 17과 Gradle 8.x 환경에서 `gradle test`로 검증합니다. 앱·웹·공유 package별 명령과 검증 범위는 [클라이언트 README](client/)에 정리되어 있습니다.

## 운영 구성

server와 web은 Docker image를 Amazon ECR에 저장하고 Amazon EKS Auto Mode에 독립 배포합니다. ALB가 `/api`와 `/actuator`를 server로, 나머지 요청을 web으로 라우팅하며, 운영 데이터는 RDS PostgreSQL에 저장합니다. Secrets Manager와 GitHub Actions OIDC를 사용해 장기 AWS access key와 application secret을 source에 두지 않습니다.

React Native 앱은 Kubernetes에서 실행하지 않으며 Android/iOS artifact pipeline으로 별도 관리합니다. 최초 인프라 구성, GitHub Environment 변수와 secret, DNS·인증서 설정은 [AWS EKS 배포 가이드](docs/aws-deployment.md)를 따릅니다.
