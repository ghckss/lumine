# Lumine Web

Lumine의 감정 일기, 마음 상태 확인, 기록 조회와 마음 리포트를 브라우저에서 제공하는 Next.js App Router 앱입니다. 현재 화면 데이터는 주로 브라우저에 저장되며, production build는 Node.js server가 아니라 정적 파일로 export됩니다.

## 기술 구성과 현재 동작

- Next.js 16.3 App Router, React 19, TypeScript 5.7
- Tailwind CSS 4와 전역 Moonlight Sanctuary theme
- Jotai browser state와 `localStorage` persistence
- workspace package `@lumine/domain`, `@lumine/api-contracts`
- ESLint, Prettier
- static export와 unprivileged Nginx production image

현재 제공하는 route는 홈(`/`), 감정 일기(`/journal`), 기록(`/records`), 마음 상태 확인(`/check`), 마음 리포트(`/report`), 설정(`/settings`)입니다. 일기와 마음 상태 결과, 표시 이름은 Jotai atom을 통해 현재 브라우저에 저장됩니다. 설정 화면에서 JSON 파일로 내려받거나 브라우저 기록을 모두 지울 수 있습니다.

마음 상태 확인은 의학적 진단이 아닌 자기 점검 UI입니다. 안전 응답이 감지되면 112·119와 자살예방상담전화 109 안내를 표시합니다.

## 사전 준비와 설치

Node.js 22(CI와 Docker build 기준), Corepack과 저장소에 고정된 pnpm 11을 사용합니다. dependency는 web 폴더가 아니라 client workspace에서 설치합니다.

```bash
corepack enable
pnpm --dir client install --frozen-lockfile
```

로컬 API를 사용할 때는 Kotlin server도 별도로 실행해야 합니다. web만 실행해도 브라우저 저장 기능은 동작하며, API 주소가 없으면 마음 상태 질문지는 `@lumine/domain`의 기본 질문을 사용합니다.

## 개발과 검증

저장소 루트에서 web 개발 서버를 `127.0.0.1:4173`에 시작합니다.

```bash
pnpm run dev:web
```

web workspace를 직접 지정할 수도 있습니다.

```bash
pnpm --dir client --filter @lumine/web run dev
```

검증과 production static export는 각각 실행합니다. `check`에는 production build가 포함되지 않습니다.

```bash
pnpm --dir client --filter @lumine/web run check
pnpm --dir client --filter @lumine/web run build
```

개별 검사는 다음과 같습니다.

```bash
pnpm --dir client --filter @lumine/web run typecheck
pnpm --dir client --filter @lumine/web run lint
pnpm --dir client --filter @lumine/web run format:check
```

## package script

`client/apps/web/package.json`의 script 9개는 다음과 같습니다.

| 이름 | 실제 command | 용도 |
| --- | --- | --- |
| `dev` | `next dev --hostname 127.0.0.1 --port 4173` | 로컬 Next.js 개발 서버를 시작합니다. |
| `build` | `next build --webpack` | webpack으로 production build와 `out/` static export를 생성합니다. |
| `start` | `next start --hostname 127.0.0.1 --port 4173` | Next.js server 시작 command입니다. 다만 현재 `output: "export"` production 배포 경로에는 사용하지 않습니다. |
| `typecheck` | `tsc --noEmit` | JavaScript를 생성하지 않고 TypeScript를 검사합니다. |
| `lint` | `eslint .` | web workspace 전체의 ESLint 검사를 실행합니다. |
| `lint:fix` | `eslint . --fix` | ESLint가 지원하는 문제를 수정합니다. |
| `format` | `prettier . --write` | Prettier로 파일을 수정합니다. |
| `format:check` | `prettier . --check` | 파일을 변경하지 않고 Prettier 형식을 검사합니다. |
| `check` | `pnpm typecheck && pnpm lint && pnpm format:check` | typecheck, lint와 format 검사를 순서대로 실행합니다. |

`start` script는 manifest에 존재하지만 현재 앱의 배포 설정은 `next.config.ts`의 `output: "export"`입니다. Production에서는 `next start`가 아니라 build가 만든 `out/`을 정적 HTTP server로 제공해야 하며, 저장소의 Docker image는 Nginx로 이 역할을 수행합니다.

## App Router 구조와 책임

```text
client/apps/web/
├── src/
│   ├── app/
│   │   ├── (home)/          # `/` route와 HomeScreen
│   │   ├── check/           # `/check` route와 질문/결과 UI
│   │   ├── journal/         # `/journal` route와 일기 작성 UI
│   │   ├── records/         # `/records` route와 기록 조회·삭제 UI
│   │   ├── report/          # `/report` route와 통계 UI
│   │   ├── settings/        # `/settings` route와 browser data 관리
│   │   ├── layout.tsx       # metadata와 전역 provider/shell 조합
│   │   └── globals.css      # theme와 전역 style
│   ├── components/          # AppShell, navigation과 공통 UI
│   ├── store/               # Jotai atom과 browser persistence
│   ├── hooks/               # 화면용 state/navigation facade
│   ├── api/                 # Lumine server HTTP client와 DTO re-export
│   ├── config/              # public API base URL parsing
│   └── lib/                 # domain export와 web 표시 상수
├── docker/nginx.conf        # static asset와 SPA-style fallback serving
├── Dockerfile               # build 후 Nginx image 생성
└── next.config.ts           # static export 설정
```

각 `page.tsx`는 metadata와 route entry만 소유하고, hook·browser API·event handler가 필요한 interactive UI는 같은 route의 `_components/*Screen.tsx`에 둡니다. 여러 route가 공유하는 shell과 visual component는 `src/components`, 전역 조합은 `layout.tsx`와 `AppProviders.tsx`가 소유합니다.

`"use client"`는 Jotai, browser API, hook 또는 event handler가 필요한 component에만 둡니다. `localStorage`와 `window`를 server-compatible module의 render 과정에서 직접 읽지 않습니다.

## 브라우저 데이터

`src/store/lumineStore.ts`가 `atomWithStorage`로 다음 데이터를 관리합니다.

- 저장 key: `lumine.web.v1`
- 저장 내용: 표시 이름, 감정 일기와 마음 상태 확인 결과
- hydration: `src/components/StorageHydrator.tsx`
- 화면 facade: `src/hooks/useLumine.ts`

이 key와 저장 shape는 기존 사용자의 호환성 경계입니다. 변경할 때는 명시적인 migration이 필요합니다. 현재 웹의 일기 작성·삭제, screening 결과 저장, 이름 변경과 전체 삭제는 server가 아니라 이 browser state를 갱신합니다. 브라우저 저장소를 지우거나 다른 browser/device를 사용하면 기록이 공유되지 않습니다.

## 현재 API 사용 범위

`src/api/client.ts`에는 로그인, profile, 계정, 일기, screening, guest import와 안전 도움 API method가 정의되어 있습니다. 그러나 현재 route UI에서 실제로 호출하는 method는 `/check`의 `getScreeningQuestionnaire()`뿐입니다.

- `NEXT_PUBLIC_LUMINE_API_BASE_URL`이 설정되어 있으면 `/check`가 공개 질문지 endpoint를 조회합니다.
- 설정이 없거나 조회가 실패하면 현재 화면은 `@lumine/domain`의 기본 질문을 유지합니다.
- screening 점수와 결과는 client에서 계산해 browser state에 저장하며 submission API를 호출하지 않습니다.
- 현재 웹 UI에는 server login/session 연결이나 server-side 일기 동기화가 없습니다.

새 server 연동은 `src/api/client.ts`의 공통 request와 `@lumine/api-contracts` type을 사용해야 합니다. API 오류를 성공으로 가장하지 말고 `ApiConfigurationError`와 `ApiError`를 화면에서 명시적으로 처리합니다.

## API 환경변수

`.env.example`에는 다음 public build variable이 있습니다.

```dotenv
NEXT_PUBLIC_LUMINE_API_BASE_URL=http://localhost:8080
```

이 localhost 값은 로컬 server 개발용 예시입니다. 실제 값은 browser가 접근할 수 있는 Lumine API origin이며 trailing slash 없이 설정하고, production build에는 공개 HTTPS origin을 사용합니다. `NEXT_PUBLIC_` 변수는 secret이 아니며 build 때 client bundle과 static export에 포함되어 사용자에게 노출됩니다. token, password, private endpoint 또는 credential을 이 변수에 넣지 않습니다.

로컬에서는 필요하면 `client/apps/web/.env.local`에 값을 넣습니다. Production Docker build는 같은 이름의 build argument를 받습니다. 정적 export 후 container runtime에 환경변수만 바꿔도 이미 생성된 bundle은 바뀌지 않으므로 API 주소를 변경하려면 새로 build하고 배포해야 합니다.

## Static export와 Docker

`next.config.ts`는 `output: "export"`와 `images.unoptimized: true`를 사용합니다. `pnpm run build`가 생성한 `out/`은 generated artifact이므로 직접 수정하거나 Git에 추가하지 않습니다.

`Dockerfile`은 다음 두 단계로 production image를 만듭니다.

1. Node.js 22 Alpine과 pnpm 11.11.0으로 web 및 workspace dependency를 설치하고 `NEXT_PUBLIC_LUMINE_API_BASE_URL`을 주입해 static export를 생성합니다.
2. `nginxinc/nginx-unprivileged` image가 `out/`을 port 8080에서 제공합니다.

`docker/nginx.conf`는 `/_next/static/`에 immutable cache를 적용하고, 일반 route는 `$uri`, `$uri.html`, `$uri/`, 마지막으로 `/index.html` 순서로 탐색합니다. Container health check는 root URL을 확인합니다.

## 운영 배포 준비

로컬 `pnpm run deploy:web`은 실제 ECR과 EKS를 변경하므로 명시적인 배포 작업에서만 실행합니다. 다음 CLI와 권한이 필요합니다.

- AWS CLI와 대상 account 인증
- Docker Buildx
- `kubectl`과 EKS 접근 권한
- 준비된 ECR web repository, EKS cluster, namespace와 ALB/ACM 설정

`scripts/deploy-web.sh`가 요구하는 환경변수는 다음과 같습니다. 값과 credential은 source에 기록하지 않습니다.

- `AWS_REGION`
- `AWS_ACCOUNT_ID`
- `ECR_WEB_REPOSITORY`
- `EKS_CLUSTER_NAME`
- `NEXT_PUBLIC_LUMINE_API_BASE_URL`
- `ACM_CERTIFICATE_ARN`
- `IMAGE_TAG` — 선택 사항이며 없으면 Git short SHA 사용

GitHub Actions 배포는 OIDC용 `AWS_ROLE_ARN` secret과 `AWS_REGION`, `AWS_ACCOUNT_ID`, `ECR_WEB_REPOSITORY`, `EKS_CLUSTER_NAME`, `ACM_CERTIFICATE_ARN`, `LUMINE_PUBLIC_BASE_URL` variable을 사용합니다. Workflow는 `LUMINE_PUBLIC_BASE_URL`을 Docker의 `NEXT_PUBLIC_LUMINE_API_BASE_URL` build argument로 전달합니다.

인프라 구성, DNS, 인증서, GitHub Environment와 rollback 절차는 [AWS EKS 배포 가이드](../../../docs/aws-deployment.md)를 따릅니다.
