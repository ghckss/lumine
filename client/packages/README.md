# Shared Client Packages

Lumine 모바일 앱과 웹 앱이 함께 사용하는 플랫폼 독립 TypeScript 코드입니다. 각 package의 공개 surface는 `src/index.ts`이며, consumer는 source 내부 경로가 아니라 package 이름으로 import합니다.

## 패키지 책임

### `@lumine/domain`

경로: [`domain/`](domain/)

- 감정과 마음 상태 확인의 공통 타입·상수
- 날짜, 인사말, 위로 문구와 일기 계산
- 달력 날짜 연산과 주간·월간 마음 리포트 계산
- UI와 runtime에 의존하지 않는 결정적 순수 함수

```ts
import { localIsoDate, buildMindReport } from "@lumine/domain";
```

### `@lumine/api-contracts`

경로: [`api-contracts/`](api-contracts/)

- server request/response payload와 client-side DTO
- `ApiError`와 재시도 가능 오류 판정
- 게스트 동기화 reconciliation
- 사용자 데이터 내보내기 직렬화 helper

```ts
import { ApiError, reconcilePendingSync } from "@lumine/api-contracts";
```

`@lumine/api-contracts`는 `@lumine/domain`에 의존할 수 있습니다. `@lumine/domain`은 `api-contracts`, mobile, web 또는 server에 의존하지 않습니다.

## 경계 규칙

- React, React Native, Next.js, Node.js 전용 API, 브라우저 global과 native module을 import하지 않습니다.
- app store/provider, 화면, navigation과 server implementation class를 넣지 않습니다.
- 공개 symbol은 각 package의 `src/index.ts`에서 export합니다.
- mobile과 web은 `@lumine/domain`, `@lumine/api-contracts`로 import하며 다른 package의 `src` 경로를 우회하지 않습니다.
- API DTO의 optionality, casing, version과 enum/string 값은 server wire model과 일치시킵니다.

## 실제 package scripts

`client/packages` 자체에는 `package.json`이나 root script가 없습니다. 두 package가 현재 제공하는 script는 각각 `typecheck` 하나입니다.

| Package | Script | 명령 | 목적 |
| --- | --- | --- | --- |
| `@lumine/domain` | `typecheck` | `pnpm --dir client --filter @lumine/domain run typecheck` | domain public type과 구현을 `tsc --noEmit`으로 검사합니다. |
| `@lumine/api-contracts` | `typecheck` | `pnpm --dir client --filter @lumine/api-contracts run typecheck` | API contract public type과 구현을 `tsc --noEmit`으로 검사합니다. |

package-local test script는 없습니다. 비단순 도메인 계산, reconciliation과 serialization test는 현재 `@lumine/app`의 Vitest harness에서 shared package를 공개 import해 실행합니다.

## 변경 후 검증

shared export를 변경하면 두 package와 두 consumer를 모두 typecheck합니다.

```bash
pnpm --dir client --filter @lumine/domain run typecheck
pnpm --dir client --filter @lumine/api-contracts run typecheck
pnpm --dir client --filter @lumine/app run typecheck
pnpm --dir client --filter @lumine/web run typecheck
```

API contract를 변경했다면 관련 server controller/model/test도 확인합니다. package script, 공개 import 또는 책임 경계를 변경할 때는 이 문서를 함께 갱신합니다.
