# Lumine Client Workspace

Lumine의 모바일 앱, 웹 앱과 공유 TypeScript package를 관리하는 pnpm 11 workspace입니다. Turborepo가 각 workspace에 실제로 정의된 개발·빌드·검사 task를 실행합니다.

## 요구 사항과 설치

- Node.js 22 권장
- Corepack
- pnpm 11.11.0

저장소 루트에서 의존성을 설치합니다.

```bash
corepack enable
pnpm --dir client install --frozen-lockfile
```

`npm install`이나 app별 lockfile을 사용하지 않습니다. 내부 package는 `workspace:*`로 연결됩니다.

## 구성과 책임

```text
client/
├── apps/
│   ├── app/                 # React Native Android/iOS 앱
│   └── web/                 # Next.js App Router 웹 앱
├── packages/
│   ├── domain/              # 플랫폼 독립 타입과 순수 도메인 계산
│   └── api-contracts/       # API DTO, 오류, 동기화·내보내기 helper
├── package.json             # workspace 진입 scripts
├── pnpm-workspace.yaml      # apps/*, packages/* 등록
└── turbo.json               # task dependency와 cache 설정
```

- [`apps/app`](apps/app/)과 [`apps/web`](apps/web/)은 독립 runtime입니다. 서로의 source를 직접 import하지 않습니다.
- 두 앱에서 공유할 플랫폼 독립 로직만 [`packages`](packages/)에 둡니다.
- `@lumine/api-contracts`는 `@lumine/domain`에 의존할 수 있지만 반대 방향은 허용하지 않습니다.
- React, React Native, Next.js, 브라우저·네이티브 API는 shared package에 넣지 않습니다.

## 실행

모든 client workspace의 개발 task를 실행하려면 저장소 루트에서 다음 명령을 사용합니다.

```bash
pnpm --dir client run dev
```

모바일과 웹은 각각 실행할 수도 있습니다.

```bash
pnpm --dir client run dev:app
pnpm --dir client run dev:web
```

모바일 simulator/emulator와 provider 설정은 [모바일 앱 README](apps/app/)를 확인하세요. 웹 환경변수와 정적 build 구성은 [`apps/web`](apps/web/) 안내를 확인하세요.

## workspace scripts

저장소 루트에서 `pnpm --dir client run <script>` 형식으로 실행합니다.

| Script | 명령 | 목적 |
| --- | --- | --- |
| `dev` | `pnpm --dir client run dev` | `dev` task가 있는 workspace를 병렬로 실행합니다. task는 persistent이며 cache하지 않습니다. |
| `dev:app` | `pnpm --dir client run dev:app` | `@lumine/app`의 개발 task인 Metro를 실행합니다. |
| `dev:web` | `pnpm --dir client run dev:web` | `@lumine/web`의 Next.js 개발 서버를 실행합니다. |
| `build` | `pnpm --dir client run build` | `build` task가 있는 workspace와 그 dependency를 빌드합니다. 현재 production build 대상은 web입니다. |
| `build:web` | `pnpm --dir client run build:web` | `@lumine/web`만 production build합니다. |
| `typecheck` | `pnpm --dir client run typecheck` | typecheck task가 있는 모든 workspace를 검사합니다. |
| `lint` | `pnpm --dir client run lint` | lint task가 있는 workspace를 검사합니다. 현재 app/shared package에는 별도 lint script가 없습니다. |
| `test` | `pnpm --dir client run test` | test task가 있는 workspace를 실행합니다. 현재 Vitest harness는 `@lumine/app`에 있습니다. |
| `check` | `pnpm --dir client run check` | workspace typecheck, lint, test task를 모두 실행합니다. |

## 검증 범위

일반적인 client 전체 검사는 다음 명령을 사용합니다.

```bash
pnpm --dir client run check
```

공유 package의 공개 type 또는 함수를 변경하면 `domain`, `api-contracts`, mobile, web typecheck를 모두 실행합니다. API wire contract가 바뀌면 server의 controller/model 및 관련 test도 함께 검증해야 합니다.

```bash
pnpm --dir client --filter @lumine/domain run typecheck
pnpm --dir client --filter @lumine/api-contracts run typecheck
pnpm --dir client --filter @lumine/app run typecheck
pnpm --dir client --filter @lumine/web run typecheck
```

package script나 workspace 구성을 바꿀 때는 이 문서의 명령 표도 함께 갱신합니다.
