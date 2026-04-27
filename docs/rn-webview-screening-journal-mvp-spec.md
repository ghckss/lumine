# RN Shell + WebView 중심 MVP 기획/기술 명세

## 0) 목표 재정의
React Native 앱 셸(최소 네이티브) 위에 Next.js WebView 앱을 탑재해, **우울감 자가선별(의료 진단 아님)** 과 마음일기 MVP를 구현 가능한 수준으로 명세한다.

## 1) 범위

### In Scope
- RN 셸: `Splash -> PermissionGate -> WebViewContainer` + `NativeModal(CrisisFallback, NetworkError, UpdateNotice)`
- RN 전용 처리: 푸시 알림, 딥링크, 로컬 보안 저장, WebView 브리지
- WebView 전용 처리(대부분): 인증/세션, 선별 플로우, 결과 안내, 마음일기, 인사이트
- Web 기술 스택 고정: Next.js App Router + Zustand + TanStack Query + Tailwind CSS
- PHQ-9 기반 점수화 + 보조 구분 문항 기반 분기 규칙
- 고위험 응답 위기 대응 플로우(즉시 도움 안내 필수)

### Out of Scope (MVP 제외)
- 의료적 진단 확정/처방/치료 행위
- 화상 상담/원격진료 연동
- 임상의 대시보드(전문가용)
- 웨어러블 연동/수면 자동수집

## 2) 화면 단위 RN vs WebView 책임

| 화면/모듈 | RN 책임 | WebView 책임 | 비고 |
|---|---|---|---|
| `Splash` | 앱 초기화, 네트워크/앱버전/브리지 준비 | 없음 | 웹 로딩 전 네이티브 고정 화면 |
| `PermissionGate` | 푸시 권한 요청 및 결과 저장 | 없음 | 거부 시 웹 설정 화면 진입 허용 |
| `WebViewContainer` | WebView 생명주기, 브리지 주입, 딥링크 전달 | 전체 메인 UX 렌더링 | 기본 진입점 |
| `/auth/*` | 토큰 보안 저장/갱신 트리거 수신 | 로그인/세션 UI 및 인증 흐름 | 인증 주체는 웹 |
| `/screening/start` | 없음 | 도구 고지, 시작 CTA | 진단 아님 고지 필수 |
| `/screening/questions` | 없음(단, 위기 이벤트 수신) | 문항 진행/응답 저장/검증 | 단일 문항 카드 UX |
| `/screening/result` | 위기 콜 액션 네이티브 fallback | 점수 계산/결과 안내/권장 행동 | 위험도 배지 + 텍스트 |
| `/journal` | 로컬 알림 스케줄 API 호출 처리 | 일기 작성/조회/편집/기분 체크 | 주요 기능 웹 처리 |
| `/insights` | 없음 | 주/월 추세, 태그 분포, 체크리스트 | TanStack Query 사용 |
| `NativeModal.CrisisFallback` | 전화/긴급버튼, 오프라인 대비 | (웹 실패 시 대체) | 위기 대응 최소 안전망 |
| `NativeModal.NetworkError` | 재시도/네트워크 상태 표시 | 없음 | 웹 로딩 실패 대체 |
| `NativeModal.UpdateNotice` | 강제/권장 업데이트 처리 | 없음 | 스토어 이동 |

## 3) RN 앱 셸 상세 스펙 (최소 네이티브)

### 3.1 앱 흐름
1. `Splash`
2. `PermissionGate`
3. `WebViewContainer`
4. 필요 시 `NativeModal` 오버레이

### 3.2 네이티브 전용 기능
- 푸시 알림
  - 권한 요청/상태 조회
  - 웹에서 전달한 리마인더 설정 요청 처리
- 딥링크
  - 앱 실행/복귀 시 링크를 WebView로 전달
- 로컬 보안 저장
  - 인증 관련 민감값(예: refresh token, device binding key) 저장
  - 앱 콜드 스타트 시 저장된 인증값을 웹 초기 핸드셰이크로 1회 전달
  - 일반 UI 상태는 저장 금지
- WebView 브리지
  - 웹 요청을 검증 후 네이티브 API 실행
  - 스키마 미일치 메시지는 거절(에러 반환)

### 3.3 브리지 계약(초안)

#### Web -> RN
- `AUTH_SAVE_SECURE`: `{ refreshToken: string }`
- `AUTH_CLEAR_SECURE`: `{}`
- `REQUEST_PUSH_PERMISSION`: `{}`
- `SCHEDULE_REMINDER`: `{ atIso: string, type: 'journal' | 'rescreen' }`
- `OPEN_CRISIS_CALL`: `{ locale: string }`
- `OPEN_EXTERNAL_URL`: `{ url: string }`
  - 허용 스킴: `https` 전용
  - 차단 스킴: `javascript:`, `intent:`, `file:`, `data:`, `about:`, `mailto:`, `tel:`
  - 허용 도메인: `APP_EXTERNAL_URL_ALLOWLIST`에 정의된 도메인만 허용(정확 매치 또는 하위 도메인)
  - 정책 위반 시 RN은 즉시 거절하고 `BRIDGE_POLICY_VIOLATION` 오류를 반환

#### RN -> Web
- `AUTH_BOOTSTRAP`: `{ refreshToken?: string, status: 'ok' | 'empty' | 'error' }`
- `DEEP_LINK_RECEIVED`: `{ path: string, query?: Record<string,string> }`
- `PUSH_OPENED`: `{ type: string, payload?: unknown }`
- `NETWORK_STATUS`: `{ online: boolean }`
- `APP_STATE_CHANGED`: `{ state: 'active' | 'background' }`
- `AUTH_LOGOUT_SYNC`: `{ reason: 'user_logout' | 'token_revoked' }`

### 3.4 인증 주체
- 인증은 WebView(Next.js) 주도
- RN은 보안 저장소 I/O 및 브리지 수행만 담당
- 세션 만료/갱신 판단은 웹 로직이 담당

### 3.5 인증 부트스트랩/동기화 규칙
1. 앱 콜드 스타트에서 WebView 준비 직후 RN은 보안 저장소를 읽어 `AUTH_BOOTSTRAP`를 1회 전송한다.
2. `status = ok`이면 웹이 세션 갱신을 시도하고, 갱신 성공 시 최신 `refreshToken`을 `AUTH_SAVE_SECURE`로 재저장한다.
3. `status = empty` 또는 `status = error`이면 웹은 비로그인 상태로 진입한다. `error`는 재로그인 안내 토스트를 노출한다.
4. 웹 로그아웃 시 `AUTH_CLEAR_SECURE`를 호출하고, RN 저장소 삭제 완료 후 `AUTH_LOGOUT_SYNC`를 전송해 상태를 동기화한다.

## 4) WebView 앱 기술 명세 (고정)

### 4.1 스택
- Next.js App Router
- Zustand
- TanStack Query
- Tailwind CSS

### 4.2 라우트 구조(핵심)
- `/auth/login`
- `/screening/start`
- `/screening/questions`
- `/screening/result`
- `/journal`
- `/insights`
- `/settings/safety`

### 4.3 App Router 레이아웃
- `app/(main)/layout.tsx`
  - 상단 상태 영역(오늘 상태/연결상태)
  - 본문 슬롯
  - 하단 고정 CTA 슬롯
- `app/(main)/screening/*`
- `app/(main)/journal/page.tsx`
- `app/(main)/insights/page.tsx`

### 4.4 Zustand 슬라이스
- `authSlice`: 세션 상태, 브리지 인증 요청 상태
- `screeningSlice`: 현재 문항, 응답, 점수, 위험도
- `journalSlice`: 오늘 기분, 임시 초안, 태그
- `uiSlice`: 전역 토스트, 모달, 접근성 설정

### 4.5 TanStack Query 키 규칙(고정)
- 중앙 모듈 `src/shared/queryKeys.ts`에서 단일 관리
- `['screening','history']`
- `['journal','entries', date]`
- `['insights','weekly']`

### 4.6 API 연동 구조
- 서버 경계
  - `POST /api/auth/login`: 웹 로그인/세션 발급
  - `POST /api/screening/submissions`: PHQ-9 + 보조 문항 제출
    - 입력 스키마 고정: `Q1..Q9` + `D1..D9` (모두 필수, `D9`는 `yes/no`)
  - `GET /api/screening/history`: 과거 선별 이력 조회
  - `GET /api/journal/entries?date=YYYY-MM-DD`: 일기 목록/단일일 조회
  - `POST /api/journal/entries`: 일기 저장/수정
  - `GET /api/insights/weekly`: 주간 인사이트 집계
- Query/Mutation 규칙
  - `useQuery(queryKeys.screening.history)`로 선별 이력 조회
  - `useQuery(queryKeys.journal.entries(date))`로 날짜별 일기 조회
  - `useQuery(queryKeys.insights.weekly)`로 인사이트 조회
  - `useMutation`은 의도 기반 이름 사용: `submitScreening`, `saveJournalEntry`
- 실패/경계 처리
  - 제출 API 실패 시 사용자 입력 초안 유지(재시도 가능)
  - 중복 제출 방지를 위해 요청 중 버튼 비활성화
  - 최신 요청만 유효 처리(이전 응답은 stale 응답으로 무시)

### 4.7 디자인/접근성 규칙
- Tailwind 토큰
  - `--color-safe`
  - `--color-caution`
  - `--color-risk`
  - `--surface`
  - `--text`
- 위험도 표시는 색상 + 텍스트 배지 + 아이콘 동시 제공
- 위기 CTA 버튼 최소 터치 영역 `44x44pt`
- 문항 선택 버튼은 스크린리더 라벨 제공
- `prefers-reduced-motion`에서 전환 애니메이션 제거 또는 축소

## 5) 우울증 유형 비교표 및 구분 포인트

> 주의: 아래는 자가선별/분류 참고용이며 의학적 진단이 아니다.

| 유형 | 핵심 증상/차이 | 기간/강도 포인트 | 구분 질문(보조) | 분기 목적 |
|---|---|---|---|---|
| 주요우울삽화 가능성(MDD pattern) | 흥미저하/우울감 + 기능저하 | 2주 이상, 일상 기능 영향 | `D1`: 증상이 대부분의 날 2주 이상 지속? | 기본 우울삽화 여부 확인 |
| 지속성 우울감 가능성(PDD pattern) | 강도는 상대적으로 낮아도 만성적 | 2년 이상 지속 | `D2`: 2년 이상 비슷한 우울감이 이어졌나? | 만성 경향 식별 |
| 양극성 스펙트럼 감별 필요 | 우울 시기 외 들뜸/과활동 시기 존재 가능 | 4일 이상의 들뜸/수면감소/과대감 | `D3`: 과도한 들뜸/수면감소 시기가 있었나? | 단극성 가정 오분류 방지 |
| 계절성 패턴 가능성 | 특정 계절 반복 악화 | 동일 계절 반복 | `D4`: 특정 계절에 반복 악화되나? | 계절성 관리 가이드 분기 |
| 산후 관련 가능성 | 출산 전후 시기 연관 | 임신/출산 후 수주~수개월 | `D5`: 임신/출산 후 시작되었나? | 산과/정신건강 전문상담 권고 |
| 적응/사별 관련 스트레스 반응 | 특정 사건 촉발 | 사건 후 시작, 시간경과 추적 필요 | `D6`: 특정 사건 직후 시작되었나? | 지지 자원 안내 강화 |

## 6) 문항 설계 (PHQ-9 중심 + 보조 구분 문항)

### 6.1 PHQ-9 기본 문항(0~3점)
응답값: `0=전혀 없음`, `1=며칠`, `2=일주일 이상`, `3=거의 매일`

- `Q1` 흥미/즐거움 저하
- `Q2` 우울/절망감
- `Q3` 수면 문제
- `Q4` 피로/에너지 저하
- `Q5` 식욕/체중 변화
- `Q6` 자책/무가치감
- `Q7` 집중 곤란
- `Q8` 초조 또는 둔화
- `Q9` 죽음/자해 생각

### 6.2 보조 구분 문항(비점수 또는 조건점수)
- `D1` 2주 이상 지속 여부 (yes/no)
- `D2` 2년 이상 지속 여부 (yes/no)
- `D3` 들뜸/과활동/수면욕구감소 기간 존재 (yes/no)
- `D4` 계절 반복성 (yes/no)
- `D5` 임신/산후 시기 연관 (yes/no/not_applicable)
- `D6` 특정 스트레스 사건 연관 (yes/no)
- `D7` 기능저하 정도 (`none/mild/moderate/severe`)
- `D8` 현재 안전감 여부 (`safe/unsafe`)  
- `D9` 자해 계획/최근 시도 추가 응답 (yes/no)
- 제출 검증 규칙: `Q1..Q9`, `D1..D9` 미응답이 하나라도 있으면 제출 거절

### 6.3 문항 매핑 표

| 문항 | 1차 의미 | 영향되는 분류/결과 |
|---|---|---|
| `Q1`,`Q2` | 핵심 우울 증상 | 우울 가능성 기본 판단 |
| `Q3~Q8` | 동반 증상 강도 | 위험도 레벨 조정 |
| `Q9` | 위기 위험 신호 | 즉시 위기 플로우 트리거 검사 |
| `D1` | 삽화 기간 | MDD pattern 보정 |
| `D2` | 만성 경향 | PDD pattern 플래그 |
| `D3` | 양극성 감별 필요 | 정신건강의학과 평가 권고 강화 |
| `D4` | 계절성 여부 | 생활패턴/광노출 권고 분기 |
| `D5` | 산후 맥락 | 산후 특화 도움 리소스 제시 |
| `D6` | 사건 촉발 | 스트레스/애도 지원 리소스 강조 |
| `D7` | 기능 저하 | 권고 행동 강도 조정 |
| `D8` | 현재 안전성 | 즉시 위기 대응 여부 결정 |
| `D9` | 자해 계획/최근 시도 | 위기 확정 오버라이드 |

## 7) 점수화/조건 분기 규칙

### 7.1 PHQ-9 점수
- `total = sum(Q1..Q9)`
- 범주
  - `0~4`: 낮음
  - `5~9`: 중간(경도)
  - `10~14`: 중간(중등도)
  - `15~19`: 높음(중등도-중증)
  - `20~27`: 높음(중증)

### 7.2 위험도 최종 단계
0. 위험 신호 상태(`signalState`)를 먼저 계산
- `crisis`: `D8 = unsafe` 또는 `Q9 >= 2` 또는 `D9 = yes`
- `warning`: `Q9 = 1` 이고 `D8 = safe` 이고 `D9 = no`
- `none`: 그 외

1. `위기(Crisis)`
- `signalState = crisis`

2. `높음(High)`
- `total >= 15`, 또는
- `D7 = severe`, 또는
- `signalState = warning`

3. `중간(Medium)`
- `total 5~14` 이고 위기/높음 조건 없음

4. `낮음(Low)`
- `total 0~4` 이고 `signalState = none` 및 `D8 = safe`

### 7.3 결과 레벨별 안내

| 레벨 | 결과 문구(비진단) | 권장 행동 | 재측정 주기 |
|---|---|---|---|
| 낮음 | 현재 우울 신호가 크지 않을 가능성이 있습니다. | 수면/활동 루틴 유지, 마음일기 주 2~3회 | 4주 |
| 중간 | 우울 신호가 관찰되어 관리가 필요할 수 있습니다. | 일기+활동기록, 신뢰인과 공유, 필요 시 상담 예약 | 2주 |
| 높음 | 우울 관련 어려움 가능성이 높아 전문가 상담이 권장됩니다. | 72시간 내 상담 연결, 자가관리 계획 강화 | 1주 |
| 위기 | 현재 안전 확보가 우선입니다. 즉시 도움을 요청하세요. | 긴급 연락/지역기관/보호자 연결 즉시 실행 | 즉시(안정 후 재평가) |

## 8) 필수 고지 및 위기 대응 플로우

### 8.1 필수 고지(모든 선별 시작/결과 화면)
- "이 결과는 의료적 진단이 아닌 자가선별 참고 정보입니다."
- "증상이 지속되거나 악화되면 전문가 상담을 받으세요."

### 8.2 위기 대응 플로우(필수)
1. 트리거
- `warning` 트리거: `Q9 = 1` 응답 시 즉시 경고 배너 표시(위기 화면 전환 없음)
- `crisis` 트리거: `Q9 >= 2` 또는 `D8 = unsafe` 또는 `D9 = yes` 응답 시 즉시 위기 배너 표시
- 전환 규칙: `signalState = crisis`이면 결과 화면 대신 위기 화면 우선 노출, `signalState = warning`이면 문항은 계속 진행하고 결과 화면에서 High CTA를 고정 노출

2. 위기 화면 구성
- 상단 경고 문구(비판단적, 짧고 명확)
- 즉시 행동 CTA 3종
  - `긴급전화`
  - `지역 위기기관 연결`
  - `신뢰인에게 도움 요청`
- "혼자가 아닙니다" 안내 + 현재 위치 기반 번호 노출

3. 지역 번호 정책(초안)
- 미국: `988` (Suicide & Crisis Lifeline), 응급 `911`
- 한국: `1393` (자살예방상담), 응급 `119`
- 기타: 지역 설정 기반 번호 테이블 사용

4. Native Fallback
- WebView 오류/오프라인 시 RN `CrisisFallback` 모달로 동일 CTA 제공

## 9) 정보 구조 및 화면 구성 규칙

### 9.1 `/screening/start`
- 도구 고지 카드
- 예상 소요시간(약 3~5분)
- 하단 고정 시작 CTA

### 9.2 `/screening/questions`
- 단일 문항 카드(한 번에 한 질문)
- 0~3 응답 버튼군(강한 선택 대비)
- 진행률 바 + 이전/다음 네비게이션
- 위기 응답 감지 시 즉시 안내

### 9.3 `/screening/result`
- 점수 요약 카드
- 위험도 배지(텍스트+아이콘+색상)
- 권장 다음 행동 섹션 분리

### 9.4 `/journal`
- 오늘 기분 체크(인라인)
- 마음일기 에디터
- 최근 기록 타임라인
- 모바일에서는 순차 스택

### 9.5 `/insights`
- 주간/월간 변화 그래프
- 트리거 태그 분포
- 회복 행동 체크리스트 카드

## 10) MVP 백로그 (에픽/스토리/우선순위)

| Epic | 스토리 | 우선순위 | 구현 위치 |
|---|---|---|---|
| E1 RN Shell | Splash/PermissionGate/WebViewContainer/NativeModal 구성 | P0 | RN |
| E2 Bridge/Security | 브리지 이벤트 스키마 + 보안 저장 + 딥링크 전달 | P0 | RN |
| E3 Web Auth | 로그인/세션/만료 처리(웹 주도) | P0 | Web |
| E4 Screening Flow | start/questions/result 라우트 + PHQ-9 진행 | P0 | Web |
| E5 Risk Engine | 점수 계산 + 레벨 분기 + 결과 문구 | P0 | Web |
| E6 Crisis Response | 위기 플로우 + 지역 번호 + Native fallback | P0 | Web+RN |
| E7 Journal MVP | 기분 체크 + 일기 CRUD + 타임라인 | P0 | Web |
| E8 Insights MVP | 주간 인사이트 카드/그래프 | P1 | Web |
| E9 Reminder | 재측정/일기 알림 스케줄 연동 | P1 | Web+RN |
| E10 Accessibility | 스크린리더/대비/터치영역/모션축소 대응 | P0 | Web+RN |

### Post-MVP 확장 분리
- 전문가 연결 파트너 연동
- 가족/보호자 공유 플로우
- 다국어/국가별 리소스 자동 확장
- 온디바이스 감정 태깅/요약 보조

## 11) 구현 순서(권장)
1. RN 셸 + 브리지 계약 고정
2. Next.js 라우팅 골격 및 공통 레이아웃 구축
3. PHQ-9 문항/점수 엔진 + 결과 단계 구현
4. 위기 대응 플로우(웹 + 네이티브 fallback) 우선 검증
5. 마음일기 CRUD
6. 인사이트/리마인더

## 12) 잠재 리스크 및 대응
- 리스크: 자가선별 결과를 진단으로 오인
  - 대응: 시작/결과 고지 고정 노출, 확정 표현 금지
- 리스크: 위기 상황에서 WebView 실패
  - 대응: RN NativeModal에 위기 CTA 내장
- 리스크: 단극성/양극성 오분류
  - 대응: `D3` 기반 감별 필요 플래그 및 전문평가 권고
- 리스크: 접근성 미흡으로 문항 이탈
  - 대응: 대형 터치 타깃, 명확한 라벨, 모션축소 대응

## 13) 판정 엔진 공통 테스트 기준(Web/API 공통)

### 13.1 정규 테스트 매트릭스(최소)

| 케이스 | 입력 핵심 | 예상 `signalState` | 예상 최종 레벨 | 예상 UI/CTA |
|---|---|---|---|---|
| `T01` | `total=4, Q9=0, D8=safe, D9=no` | `none` | `Low` | 일반 결과 + 4주 재측정 |
| `T02` | `total=5, Q9=0, D8=safe, D9=no` | `none` | `Medium` | 중간 권장 행동 |
| `T03` | `total=9, Q9=0, D8=safe, D9=no` | `none` | `Medium` | 중간 권장 행동 |
| `T04` | `total=10, Q9=0, D8=safe, D9=no` | `none` | `Medium` | 중간 권장 행동 |
| `T05` | `total=14, Q9=0, D8=safe, D9=no` | `none` | `Medium` | 중간 권장 행동 |
| `T06` | `total=15, Q9=0, D8=safe, D9=no` | `none` | `High` | High CTA 고정 |
| `T07` | `total=2, Q9=1, D8=safe, D9=no` | `warning` | `High` | 경고 배너 + High CTA, 위기 화면 미전환 |
| `T08` | `total=2, Q9=2, D8=safe, D9=no` | `crisis` | `Crisis` | 위기 화면 즉시 전환 |
| `T09` | `total=0, Q9=0, D8=unsafe, D9=no` | `crisis` | `Crisis` | 위기 화면 즉시 전환 |
| `T10` | `total=0, Q9=0, D8=safe, D9=yes` | `crisis` | `Crisis` | 위기 화면 즉시 전환 |
| `T11` | `D9` 누락(기타 정상) | 계산 불가 | 제출 거절 | 검증 에러 노출(저장/전송 금지) |
| `T12` | `total=18, Q9=2, D8=safe, D9=no` | `crisis` | `Crisis` | Crisis 우선(High 결과 화면 금지) |

### 13.2 테스트 실행 규칙
- Web 판정 로직과 API 판정 로직은 위 `T01~T12` 입력셋을 동일하게 사용해야 한다.
- 릴리스 전 체크: Web과 API의 케이스별 `signalState`, `level`, `CTA`가 1:1 일치해야 한다.
