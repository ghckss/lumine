# 마음 상태 확인 + 감정 일기 MVP 개발 문서

## 1. 시스템 개요
- 앱은 React Native 셸 위에 WebView 기반 웹 앱을 올리는 구조로 구현해요.
- 도메인 UI와 주요 사용자 흐름은 웹에서 처리하고, 네이티브는 권한, 저장소, 알림, 브리지 역할에 집중해요.

구현 위치:
- `server/`: Spring Boot + Kotlin
- `app/`: React Native 셸
- `web/`: Next.js WebView 앱

## 2. 기술 스택
### 2.1 서버
- Kotlin
- Spring Boot
- Spring Web
- Spring Security
- Spring OAuth2 Client
- Spring Data JPA
- Bean Validation
- PostgreSQL

### 2.2 웹
- Next.js App Router
- Zustand
- TanStack Query
- Tailwind CSS

### 2.3 앱
- React Native
- WebView
- 네이티브 보안 저장소
- 푸시 알림
- 딥링크 처리

## 3. 인증과 가입
### 3.1 인증 정책
- 인증은 웹 주도로 처리해요.
- RN은 보안 저장과 브리지 전달만 담당해요.
- 로그인 제공자는 카카오, 구글 2개로 고정해요.

### 3.2 회원 프로필
- 소셜 제공자 타입
- 소셜 식별자
- 성별
- 생년월일
- 가입 시각
- 약관 동의 정보

### 3.3 가입 정보 기반 질문 분기
- 서버는 프로필을 기준으로 질문 세트를 동적으로 구성해요.
- 성별과 나이에 따라 주산기, 월경, 임신 질문 노출 여부를 결정해요.
- 사용자에게는 `왜 질문이 빠졌는지` 별도 설명하지 않고, 자연스럽게 관련 질문만 보여줘요.

## 4. 브리지 아키텍처
### 4.1 설계 원칙
- 앱과 웹은 각각 하나의 브리지 함수만 외부에 노출해요.
- 세부 기능은 개별 함수로 흩어지지 않고 command registry로 분기해요.
- iOS가 비동기 응답을 반환하는 조건을 기준으로, 양방향 모두 `async/await` 기반 비동기 함수로 통일해요.
- Android도 동일 계약을 따라 플랫폼 차이를 숨겨요.

### 4.2 외부 인터페이스
```ts
webToApp(command, params): Promise<BridgeResponse>
appToWeb(command, params): Promise<BridgeResponse>
```

예시:
```ts
await webToApp('auth.saveSecure', { refreshToken })
await webToApp('reminder.schedule', { atIso, type: 'journal' })
await appToWeb('auth.bootstrap', { refreshToken, status: 'ok' })
```

### 4.3 요청 / 응답 규격
```ts
type BridgeRequest = {
  requestId: string
  command: string
  params?: Record<string, unknown>
}

type BridgeResponse = {
  requestId: string
  ok: boolean
  data?: unknown
  error?: {
    code: 'TIMEOUT' | 'UNKNOWN_COMMAND' | 'INVALID_PARAMS' | 'POLICY_VIOLATION' | 'INTERNAL_ERROR'
    message: string
  }
}
```

### 4.4 동작 규칙
- 각 요청은 고유 `requestId`를 가져야 해요.
- 응답은 반드시 동일한 `requestId`로 돌아와야 해요.
- 등록되지 않은 command는 즉시 `UNKNOWN_COMMAND`를 반환해요.
- 파라미터 검증 실패는 `INVALID_PARAMS`를 반환해요.
- 정책 위반 URL, 허용되지 않은 스킴, 금지된 동작은 `POLICY_VIOLATION`을 반환해요.
- 지정 시간 안에 응답이 없으면 `TIMEOUT`으로 처리해요.

### 4.5 Web -> App command registry
- `auth.saveSecure`
- `auth.clearSecure`
- `push.requestPermission`
- `reminder.schedule`
- `support.openHotline`
- `external.openUrl`

### 4.6 App -> Web command registry
- `auth.bootstrap`
- `app.deepLink`
- `push.opened`
- `network.changed`
- `app.stateChanged`
- `auth.logoutSync`

### 4.7 브리지 구현 주의사항
- 브리지에 새 기능을 추가할 때는 외부 함수를 늘리지 않고 command registry에만 command를 추가해요.
- Promise resolve / reject 기준은 플랫폼별로 다르게 두지 않아요.
- WebView 메시지 포맷은 직렬화 가능한 JSON만 허용해요.
- iOS 비동기 응답 순서가 뒤섞일 수 있으므로, pending map을 `requestId` 기준으로 관리해요.

## 5. RN 책임
- `Splash -> PermissionGate -> WebViewContainer` 흐름을 관리해요.
- 푸시 권한 요청과 상태 조회를 처리해요.
- 보안 저장소에 인증 민감값을 저장하고 삭제해요.
- 웹이 실패했을 때 안전 도움 fallback을 보여줘요.
- 딥링크와 푸시 탭 이벤트를 브리지로 웹에 전달해요.

## 6. Web 책임
- 로그인과 세션 흐름을 처리해요.
- 상태 확인 질문, 결과, 감정 일기, 기록 조회 UI를 렌더링해요.
- 서버와의 데이터 통신은 TanStack Query 기반으로 관리해요.
- 브리지 호출은 단일 클라이언트 모듈로 감싸서 사용해요.

## 7. 서버 도메인 모델
- `User`
- `UserProfile`
- `ScreeningSession`
- `ScreeningAnswer`
- `ScreeningResult`
- `JournalEntry`
- `JournalEmotion`
- `ComfortMessageTemplate`
- `CrisisResource`

## 8. 상태 확인 질문 설계
### 8.1 기본 원칙
- PHQ-9 계열 핵심 질문을 사용하되, 사용자에게는 부드러운 표현으로 재작성해요.
- 내부 판정에는 점수형 응답과 보조 문항을 함께 사용해요.
- 서술형 질문은 선택 응답 뒤에 선택적으로 붙여요.

### 8.2 질문 세트 구성
- 기본 질문
- 상태 지속 기간 질문
- 기능 저하 질문
- 계절성 / 사건성 / 주산기 / 양극성 감별 질문
- 서술형 질문

### 8.3 질문 분기 규칙
- 남성 사용자에게는 월경, 임신, 산후 문항을 제외해요.
- 관련 연령이 아닌 경우 주산기 문항을 제외해요.
- 위험 응답 감지 시 안전 확인 문항과 도움 안내를 우선해요.

## 9. 내부 평가 모델
### 9.1 저장 필드
- `publicSummary`
- `publicComfortMessage`
- `internalSubtype`
- `internalChronicity`
- `requiresSafetyPrompt`
- `recommendedRescreenAt`

### 9.2 subtype 후보
- 주요 우울 삽화 경향
- 지속성 우울 경향
- 계절성 양상 가능성
- 주산기 관련 가능성
- 스트레스 사건/적응 반응 가능성
- 양극성 감별 필요

### 9.3 chronicity 구분
- `short_term`
- `long_term`

### 9.4 safety signal 구분
- `none`
- `warning`
- `crisis`

## 10. 결과 생성 정책
- 내부 판정 결과는 서버에 저장하지만 사용자에게는 노출하지 않아요.
- 사용자 응답에는 진단명 대신 해석형 문장만 내려줘요.
- 위험 응답이 있으면 결과 화면보다 안전 도움 화면 진입이 우선이에요.
- 기본 재확인 권장일은 4주 후로 계산해요.
- 위험 신호가 있거나 큰 사건이 있으면 조기 재확인을 허용해요.

## 11. 감정 일기 기능
### 11.1 저장 규칙
- 하루 1개 엔트리 기준으로 처리해요.
- 감정 3개는 필수예요.
- 자유 입력 본문은 선택 또는 자유 길이로 허용해요.

### 11.2 위로 문구 처리
- 저장 요청 시 서버 또는 클라이언트 규칙으로 위로 문구를 생성할 수 있어요.
- UI는 저장 응답 시간과 무관하게 최소 1초 동안 위로 문구를 보여줘야 해요.
- 저장 실패 시에도 사용자가 작성한 내용은 유지해야 해요.

## 12. API 초안
### 12.1 인증
- `POST /api/auth/login/kakao`
- `POST /api/auth/login/google`
- `POST /api/auth/logout`

### 12.2 프로필
- `POST /api/users/profile`
- `GET /api/users/me`

### 12.3 질문지 / 결과
- `GET /api/screening/questionnaire`
- `POST /api/screening/submissions`
- `GET /api/screening/history`

### 12.4 감정 일기
- `POST /api/journal/entries`
- `GET /api/journal/entries?date=YYYY-MM-DD`

### 12.5 안전 리소스
- `GET /api/support/resources`

## 13. 한국 전용 안전 정책
- 기본 안전 리소스는 한국 기준으로 내려줘요.
- 우선 노출 번호:
  - `109`
  - `119`
  - `129`
- WebView가 실패하거나 오프라인이어도 RN fallback에서 동일 정보를 제공해야 해요.

## 14. 테스트 기준
### 14.1 분기와 결과
- 남성 사용자에게 주산기 관련 문항이 제외되는지 확인해요.
- 관련 연령 외 사용자에게 주산기 관련 문항이 제외되는지 확인해요.
- subtype과 chronicity가 의도대로 계산되는지 확인해요.
- 사용자 응답에 진단명이 포함되지 않는지 확인해요.

### 14.2 감정 일기
- 감정 3개가 없으면 저장되지 않는지 확인해요.
- 저장이 300ms 만에 끝나도 위로 문구가 1초 이상 유지되는지 확인해요.
- 저장 실패 시 본문과 감정 선택이 유지되는지 확인해요.

### 14.3 안전 정책
- 위험 응답 시 결과 화면보다 안전 도움 화면이 우선하는지 확인해요.
- 한국 안전 번호가 올바르게 노출되는지 확인해요.
- RN fallback에서도 동일 정보가 보이는지 확인해요.

### 14.4 브리지
- `webToApp`, `appToWeb` 외 추가 외부 함수가 없는지 확인해요.
- 등록되지 않은 command 호출 시 `UNKNOWN_COMMAND`가 반환되는지 확인해요.
- iOS 응답 지연 시에도 `requestId` 기준으로 올바른 Promise가 정리되는지 확인해요.
- timeout 발생 시 표준 오류 구조가 내려오는지 확인해요.
