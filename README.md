# Lumine

**lumis eterne - 당신의 영원한 빛**

## 당신의 우울이 별이 되는 곳, Lumine

밤이 깊을수록 별은 더 선명하게 빛납니다.  
우리 마음속의 우울도 사실은 당신이 가진 가장 깊은 빛일지도 몰라요.

Lumine은 당신에게 `빨리 나아지라`고 재촉하지 않습니다.  
그저 오늘 하루 당신이 머물렀던 감정의 궤적을  
은은한 라벤더 빛으로 감싸 안아줄 뿐입니다.

사라지지 않는 영원한 마음의 빛, **Lumis Eterne**.  
오늘 당신의 조각난 마음들을 이곳에 가만히 내려놓으세요.

## Run All

```bash
cd /Users/hwanghochan/workspace/private/lumine
npm run dev:all
```

개별 실행:

- `npm run dev:server`
- `npm run dev:client` (app, web 동시 실행)
- `npm run dev:metro`
- `npm run dev:web`
- `npm run dev:ios`
- `npm run dev:android`

클라이언트 전체 검사:

```bash
npm run check:client
```

웹 프로덕션 파일 생성:

```bash
npm run build:web
```

## Deploy

운영 구성은 Docker, Amazon ECR, EKS Auto Mode, ALB, RDS PostgreSQL, Secrets Manager와 GitHub Actions OIDC를 사용한다. 최초 인프라 생성과 GitHub 설정은 [`docs/aws-deployment.md`](docs/aws-deployment.md)를 따른다.

스토어 아티팩트:

- `npm run artifact:android`
- `npm run artifact:ios`
- `npm run artifact:app`

루트 기준 커맨드:

- `npm run deploy:server`
- `npm run deploy:web`
- `npm run deploy:all`

GitHub Actions:

- `master` 브랜치의 서버 관련 변경 시 `.github/workflows/deploy.yml` 실행
- 웹 관련 변경 시 `.github/workflows/deploy-web.yml` 실행
- 클라이언트 변경 시 `.github/workflows/client-checks.yml`에서 app과 web을 독립적으로 검사
- 필요 변수: `AWS_REGION`, `AWS_ACCOUNT_ID`, `ECR_SERVER_REPOSITORY`, `AWS_APPRUNNER_SERVICE_ARN`, `LUMINE_API_BASE_URL`
- `production` Environment 시크릿: `AWS_ROLE_ARN`

## Structure

- `server/`: 기존 Spring Boot + Kotlin API 서버. 클라이언트와 별도로 빌드·배포합니다.
- `client/`: pnpm workspace와 Turborepo 기반 클라이언트 모노레포
  - `apps/app/`: React Native 앱
  - `apps/web/`: Next.js App Router 기반 SPA 웹 앱
  - `packages/domain/`: app과 web이 함께 사용하는 세션·감정·자가진단 타입과 상수

GitHub에는 하나의 저장소로 관리하면서 `server`, `client/apps/app`, `client/apps/web`을 독립적인 빌드·배포 단위로 유지합니다. 두 클라이언트 서비스에서 함께 쓰는 코드는 `client/packages`에 둡니다.

## Notes

- 현재 저장소는 제품 기획, 디자인, 웹, 서버 작업이 함께 진행 중인 상태입니다.
- 디자인 톤앤매너는 `lumis eterne` 브랜딩과 [`docs/designs.md`](docs/designs.md) 기준의 `Moonlight Sanctuary` 디자인 시스템으로 정리합니다.
