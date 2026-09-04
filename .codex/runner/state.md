# Runner State Store

## Active Workflow — 3.2 주간·월간 마음 리포트

### Requirement Contract

- 현재 홈의 최근 7일 요약을 주간·월간 마음 리포트로 확장한다.
- 기록 일수, 자주 느낀 감정, 직전 동일 길이 기간과의 변화, 무거웠던 날·편안했던 날, 마음 확인 변화, 다음 기간의 작은 행동 한 가지를 제공한다.
- 주간은 월요일~일요일, 월간은 달력 월이며 진행 중인 기간은 직전 기간의 동일 경과 일수와 비교한다.
- 리포트는 현재 기록에서 다시 계산하며 로그인 계정과 게스트 데이터를 완전히 분리한다.
- 데이터 부족 상태를 명시하고 의료적 진단·점수 노출·푸시 발송·파일 공유는 범위에서 제외한다.
- 안전 신호가 포함된 마음 확인 결과는 일반적인 호전·악화 표현으로 축소하지 않고 안전 지원을 우선한다.

### Implementation Plan

1. 기존 마음 확인 답변에서 내부 비교값을 산출해 제출·이력 응답에 선택적으로 제공한다.
2. 기간·감정·변화·대표 날짜·작은 행동을 계산하는 순수 TypeScript 리포트 모듈과 단위 테스트를 추가한다.
3. 주간·월간 상세 화면과 빈 상태·안전 지원 동선을 구현한다.
4. 홈 7일 카드를 동일 계산 모듈 기반 리포트 진입점으로 바꾸고 일기 로드 범위를 70일로 확장한다.
5. 서버/앱 테스트, 타입 검사, Android/iOS 빌드, 구조·dead-code 검토와 현재 기능 문서를 검증한다.

### Active Decision Records

- 2026-09-04: Gate 1 요구사항 계약 승인.
- 2026-09-04: Gate 2 구현 계획 승인, Implementation Autopilot 시작.
- 2026-09-04: 리포트는 별도 영속 엔티티 없이 현재 사용자 기록에서 재계산하고 계산 규칙은 앱의 순수 도메인 모듈로 단일화한다.
- 2026-09-04: 마음 확인 비교값은 API 내부 데이터로만 사용하고 사용자 화면에는 숫자 점수를 노출하지 않는다.
- 2026-09-04: 최종 계약 대조와 구조 검토에서 추가 범위 내 결함을 발견하지 않아 Refinement Loop에 진입하지 않고 완료한다.

### Active Status

- stage: complete
- current_chunk: final validation complete
- max_self_repair_attempts: 2
- max_review_iterations: 2
- max_refinement_iterations: 2

### Active Known Constraints

- `docs/future-feature-planning.md`의 기존 수정과 `docs/current-feature-patch-notes.md`의 기존 미추적 파일은 사용자 소유 작업으로 취급한다.
- 기존 게스트 캐시와 구버전 서버 응답에는 마음 확인 비교값이 없을 수 있으므로 선택 필드로 하위 호환한다.
- 실제 기기 수동 UX와 실제 PostgreSQL 실행 환경은 현재 로컬 검증 범위에 없을 수 있다.

### Active Risk Reports

- 감정의 편안함·무거움 분류는 사용자의 주관과 다를 수 있어 기록 기반 회고 표현만 사용한다.
- 월초·주초 및 과거 비교값이 없는 기록은 변화 판단이 제한된다.
- 현지 날짜 연산을 잘못 다루면 기간 경계가 어긋날 수 있어 문자열 기반 달력 연산과 경계 테스트가 필요하다.

### Active Current Codebase Snapshot

- 구현 HEAD: `b0edee2`; 이후 최종 검증 State Store 커밋이 추가된다. 작업 시작점은 `b11bec9`, 브랜치는 `dev`.
- 홈은 달력 주간 리포트 진입점이며 상세 화면에서 주간·월간 리포트를 같은 순수 계산 모듈로 제공한다.
- 앱은 로그인 일기 70개와 마음 확인 이력 20개를 로드하고, 게스트와 계정별 기존 컨텍스트 경계를 유지한다.
- 서버는 마음 확인 제출·이력에 화면 비노출 비교값을 제공하며 안전 신호는 별도로 유지한다.
- 작업 트리에는 Runner 범위 밖 문서 변경 2건이 그대로 존재한다.

### Active Remaining Known Issues

- 기존 게스트 캐시나 구버전 서버에서 받은 마음 확인 결과는 `comparisonScore`가 없어 호환 가능한 결과가 두 번 쌓일 때까지 변화가 데이터 부족으로 표시된다.
- 실제 기기에서 리포트의 시각적 배치와 기록 상세 이동을 수동 검증하지 못했으며 Android/iOS 빌드로 네이티브 연결만 확인했다.
- iOS 빌드에서 일부 Pod의 낮은 deployment target 및 deprecation 경고가 남지만 빌드는 성공한다.

### Active Chunk Commit History

- `ab1e7b9` — Chunk 1: 마음 확인 제출·이력에 내부 비교값 추가, 허용 문항·응답 제한, 사용자 격리 포함 서버 15개 테스트 통과.
- `4cc32bd` — Chunk 2: 주간·월간 기간, 감정 빈도·변화, 대표 날짜, 마음 확인 흐름, 작은 행동 계산과 앱 테스트 추가.
- `b0edee2` — Chunk 3: 주간·월간 리포트 화면, 홈 진입점, 70일 일기 로드, 게스트·서버 비교값 연결.

### Active Validation Logs

- Chunk 1: 첫 테스트 실행에서 잘못된 테스트 제공자 경로를 발견해 픽스처를 수정했다.
- Chunk 1: 서버 15개 테스트와 `git diff --check -- server` 통과.
- Chunk 2: 앱 Vitest 18개 테스트, TypeScript 검사, 대상 파일 diff 검사 통과.
- Chunk 3: 앱 Vitest 18개 테스트, TypeScript 검사, Android Debug와 iOS Simulator Debug 전체 빌드, 전체 diff 검사 통과.
- Final: 서버 15개 테스트, 앱 Vitest 18개 테스트, TypeScript 검사, Android Debug 전체·증분 빌드, iOS Simulator Debug 전체·증분 빌드, `git diff --check b11bec9..HEAD` 통과.

### Active Review Reports

- Chunk 1 정확성 검토: 알 수 없는 문항과 범위 밖 숫자가 비교값에 포함될 수 있어 `q1`~`q10`, 0~3 응답으로 제한 후 재검증.
- Chunk 1 보안·타입·구조 검토: 사용자별 이력 범위 유지, 선택적 앱 호환 계획, DB 변경 없음. 추가 필수 이슈 없음.
- Chunk 2 정확성 검토: 짧은 이전 달을 넘는 비교 종료일, 기간 내 이른 안전 신호 누락, 중복 날짜 집계를 수정하고 경계 테스트 추가.
- Chunk 2 타입·구조·유지보수 검토: 화면 비의존 순수 모듈과 선택 비교값 경계 확인. 추가 필수 이슈 없음.
- Chunk 3 정확성·보안 검토: 동일 계산 모듈 기반 홈/상세, 계정별 기존 컨텍스트, 구버전 비교값 누락 처리, 안전 지원 우선 동선 확인.
- Chunk 3 접근성·성능·유지보수 검토: 탭 선택 상태, 최소 터치 높이, 제한된 70일 조회, 기존 홈 중복 집계 제거 확인. 추가 필수 이슈 없음.
- Final 정확성·보안·회귀 검토: 승인 계약 전 항목, 사용자/게스트 격리, 기간 경계, 안전 신호 우선 처리와 구버전 응답 호환을 재확인. 추가 필수 이슈 없음.
- Final 구조·dead-code 검토: 홈과 상세의 계산 단일화, 라우트 연결, 구형 최근 7일 직접 집계 제거, 새 순환 의존성 부재를 확인. 추가 필수 이슈 없음.

### Active Final Validation Result

- PASS — 주간은 월요일~일요일, 월간은 달력 월로 계산하고 진행 중인 기간은 직전 기간의 동일 경과 일수와 비교한다.
- PASS — 기록 일수, 상위 감정과 변화, 편안했던 날·무거웠던 날, 마음 확인 변화, 결정적인 작은 행동 한 가지를 제공한다.
- PASS — 대표 날짜에서 기록 상세로 이동하고 데이터가 없을 때 기록 작성 동선을 제공한다.
- PASS — 마음 확인 안전 신호는 일반 변화보다 우선하며 숫자 점수나 진단 표현을 화면에 노출하지 않는다.
- PASS — 홈과 상세 화면이 같은 순수 계산 모듈을 사용하고 계정·게스트별 기존 데이터 경계를 유지한다.
- PASS — 서버/앱 자동 테스트, 타입 검사, Android/iOS 빌드와 전체 diff 검사를 통과했다.
- PASS — 승인 범위에서 중복 계산과 obsolete code를 제거했으며 추가 refinement가 필요한 결함을 발견하지 못했다.

---

## Previous Workflow — 2.2 작성 안정성

### Requirement Contract

- 사용자/게스트와 날짜별 일기 초안을 약 700ms 디바운스로 자동 저장하고 재진입·재실행 시 복원한다.
- 저장 실패 시 감정과 본문을 유지하고 사용자가 재시도할 수 있게 한다.
- 인증 사용자의 네트워크·5xx 실패 저장은 계정별 큐에 보존하고, 연결 복구 또는 앱 활성화 시 자동 재전송한다.
- 목록과 상세 화면에서 동기화 대기·실패·충돌 기록을 구분한다.
- 일기 삭제 후 5초 동안 실행 취소할 수 있으며 감정·본문·위로 문구를 정확히 복원한다.
- 서버 데이터와 모든 로컬 초안·큐는 계정 간 완전히 분리한다.
- 마음 확인 초안/삭제, 장기 휴지통, 백그라운드 푸시 동기화는 범위 밖이다.

### Implementation Plan

1. 서버 일기 버전 기반 조건부 저장과 사용자 범위 삭제 API.
2. 날짜별 초안 저장소와 계정별 저장·삭제 작업 큐.
3. 저장 실패·재시도·동기화 상태·5초 삭제 취소 UI.
4. 네트워크 복구 및 앱 활성화 자동 동기화.
5. 서버/앱 테스트, 타입 검사, Android/iOS 빌드, 구조 검토.

### Active Decision Records

- 2026-09-03: 작성 안정성 Gate 1 요구사항 계약 승인.
- 2026-09-03: 작성 안정성 Gate 2 구현 계획 승인, Implementation Autopilot 시작.
- 2026-09-03: 원격 삭제는 5초 유예가 끝난 뒤 실행한다. 유예 중에는 영속 작업의 스냅샷으로 정확히 복원한다.
- 2026-09-03: 인증 사용자 작업 큐는 기존 게스트 계정 이전 큐와 분리하고 owner key를 저장 키에 포함한다.
- 2026-09-03: 새 앱은 일기 version을 항상 보내 충돌을 탐지하고, 기존 클라이언트의 version 생략 저장은 호환을 위해 유지한다.
- 2026-09-03: 앱 UI와 자동 재전송은 동일한 AppProvider 상태·큐 경계를 공유하므로 청크 3·4를 하나의 검증/커밋 경계로 합쳤다. 승인된 구조와 범위 변경은 없다.
- 2026-09-03: 큐 쓰기와 동기화 실행을 직렬화하고, 계정 전환 시 이전 계정 상태를 즉시 비워 교차 계정 노출과 작업 유실을 방지한다.
- 2026-09-03: 최종 계약 대조와 구조 검토에서 추가 범위 내 결함을 발견하지 않아 Refinement Loop에 진입하지 않고 완료한다.

### Active Status

- stage: complete
- current_chunk: final validation complete
- max_self_repair_attempts: 2
- max_review_iterations: 2
- max_refinement_iterations: 2

### Active Known Constraints

- 앱 순수 RN 마이그레이션과 `web/` 제거를 포함한 사용자 소유 dirty worktree가 존재한다.
- 앱 변경 파일이 기존 사용자 변경과 겹치면 Runner 전용 커밋 대신 commit blocker를 기록한다.
- `JournalModels.kt`의 기존 본문 검증 변경은 사용자 소유이므로 되돌리거나 별도 변경으로 취급하지 않는다.

### Active Validation Logs

- Chunk 1: Spring Boot 14개 테스트 및 `git diff --check -- server` 통과.
- Chunk 2: 앱 Vitest 6개 테스트, TypeScript 검사, `git diff --check -- app` 통과.
- Chunk 3-4: 앱 Vitest 9개 테스트, TypeScript 검사, Android `assembleDebug`, iOS Simulator Debug 전체·증분 빌드, Pod 설치 및 `git diff --check` 통과.
- Final: Spring Boot 14개 테스트, 앱 Vitest 9개 테스트, TypeScript 검사, Android/iOS 빌드와 `git diff --check 499670c..HEAD` 재통과.

### Active Review Reports

- Chunk 1 정확성 검토: 충돌 확인 전 위로 문구 생성 호출과 동시 낙관적 잠금 예외의 500 변환을 발견해 409 변환으로 수정.
- Chunk 1 보안·테스트·구조 검토: principal 기반 사용자 범위, 조건부 삭제, Flyway 기본값 확인. 추가 필수 이슈 없음.
- Chunk 2 정확성·격리 검토: draft/operation 저장 키에 owner 포함, 날짜별 작업 병합과 삭제 overlay 확인. 필수 이슈 없음.
- Chunk 3-4 정확성 검토: 동기화와 신규 큐 쓰기 경쟁, 성공 후 초안 정리 실패의 중복 저장 위험, 만료된 게스트 삭제 재개 문제를 수정.
- Chunk 3-4 보안·타입·접근성·유지보수 검토: owner 전환 초기화, 44pt 실행 취소 터치 영역, 키 생성 단일화 반영. 추가 필수 이슈 없음.

### Active Chunk Commit History

- `8e9ab67` — Chunk 1: version 기반 조건부 저장/삭제, PostgreSQL V4, 통합 테스트.
- Chunk 2: commit pending — 계정별 draft/operation 저장소, sync metadata, API 오류 타입과 단위 테스트.
- `c596930` — Chunk 2: 계정별 draft/operation 저장소, sync metadata, API 오류 타입과 단위 테스트.
- `a0d8fda` — Chunk 3-4: 700ms 초안, 오류/재시도 UI, 상태 표시, 5초 삭제 취소, NetInfo/AppState 재전송과 네이티브 연결.

### Active Current Codebase Snapshot

- 구현 HEAD: `a0d8fda`; 이후 최종 검증 State Store 커밋이 추가됨. 작업 시작점은 `499670c`, 브랜치는 `dev`.
- 서버: 사용자 범위 일기 저장/삭제, JPA version 충돌 탐지, PostgreSQL V4 마이그레이션.
- 앱: owner-scoped 초안·작업 큐, 실패 보존/수동 재시도, pending/failed/conflict/local 표시, 5초 삭제 취소, 연결 복구·앱 활성화 재전송.
- 작업 트리: clean.

### Active Remaining Known Issues

- 실제 PostgreSQL 인스턴스에서 V4 마이그레이션을 실행하지 못해 H2 통합 테스트와 SQL 검토로 대체했다.
- 실제 기기에서 네트워크를 끊고 복구하는 수동 UX 검증은 남아 있으며, NetInfo 네이티브 연결은 Android/iOS 빌드로 검증했다.

### Active Final Validation Result

- PASS — 감정·본문·직접 입력 감정이 사용자/게스트와 날짜별로 700ms 후 저장되고 재진입 시 복원된다.
- PASS — 저장 실패 시 작성 상태와 작업 스냅샷을 유지하며 작성 화면 및 상세 화면에서 재시도할 수 있다.
- PASS — 대기·실패·충돌·기기 전용 상태가 목록과 상세에 표시되고 서버 새로고침에도 로컬 작업이 보존된다.
- PASS — 네트워크 복구와 앱 활성화 시 현재 계정의 retryable 작업만 자동 재전송된다.
- PASS — 삭제 작업은 5초간 서버로 전송되지 않으며 실행 취소 시 감정·본문·위로 문구와 기존 미전송 작업이 정확히 복원된다.
- PASS — 서버 version 불일치 저장·삭제는 409로 보존되고 사용자 principal 범위를 벗어난 데이터에 접근하지 않는다.
- PASS — 승인 작업으로 생긴 중복 키 정의와 비동기 경쟁을 제거했으며 새 순환 의존성이나 obsolete code를 발견하지 못했다.

---

## Previous Workflow — 2.1 계정별 데이터 관리

## Requirement Contract

- JWT 인증 계정별로 서버 일기와 마음 확인 결과를 완전히 격리한다.
- 로그인 후 명시적 동의가 있을 때만 게스트 기록을 계정으로 이전한다.
- 이전 진행·완료·부분 실패를 표시하고 실패 항목은 재시도할 수 있게 보존한다.
- 같은 날짜의 서버 일기와 게스트 일기가 충돌하면 서버 기록을 유지하고 게스트 항목을 기기에 보존한다.
- Lumine 계정 탈퇴 시 서비스 서버 데이터를 삭제하며 소셜 제공자 계정은 삭제하지 않는다.
- 본인 기록을 UTF-8 JSON 파일로 내보낼 수 있게 한다.
- 안전 도움 기능은 데이터 상태와 관계없이 항상 접근 가능해야 한다.

## Implementation Plan

1. 영속 사용자 계정과 JWT 인증 기반.
2. 일기·마음 확인 데이터 사용자별 격리와 DB 마이그레이션.
3. 게스트 기록 이전 동의, 멱등 동기화, 상태 표시.
4. 계정 탈퇴·서버 데이터 삭제와 JSON 내보내기.
5. 전체 회귀 검증, 구조·dead-code 점검, 기획 문서 갱신.

## Plan Patch History

- 없음. 승인된 계획 범위 안에서 진행 중.

## Review Reports

- Chunk 1: 인증 필터, JWT 검증, 사용자 영속성 검토 완료. 필수 수정 없음.
- Chunk 2: 모든 개인 콘텐츠 조회·저장 경로의 userId 범위와 PostgreSQL 신규/기존 DB 마이그레이션 검토 완료. 필수 수정 없음.
- Chunk 3: 항목별 트랜잭션, 계정별 멱등 영수증, 일기 충돌 보존, 부분 실패 큐 유지 검토 완료. 필수 수정 없음.
- Chunk 4: principal 기반 내보내기, 하위 엔티티 우선 삭제, 소셜 계정 비삭제, 계정 로컬 캐시 정리 흐름 검토 완료. 필수 수정 없음.

## Validation Logs

- Chunk 1: Spring Boot 테스트 통과.
- Chunk 2: Spring Boot 11개 테스트 통과, `git diff --check` 통과.
- Chunk 3: Spring Boot 12개 테스트 통과, 앱 `pnpm exec tsc --noEmit` 통과, `git diff --check` 통과.
- Chunk 4: Spring Boot 13개 테스트, 앱 Vitest 3개 테스트, TypeScript 검사, Android `assembleDebug` 통과. iOS Pod에 RNFS/RNShare 연결 완료.
- Chunk 5: 서버 13개 테스트, 앱 Vitest 3개 테스트, TypeScript 검사, Android `assembleDebug`, iOS Simulator Debug 전체·증분 빌드, `git diff --check` 통과.

## Decision Records

- 2026-09-03: Gate 1 요구사항 계약 승인.
- 2026-09-03: Gate 2 구현 계획 승인, Implementation Autopilot 시작.
- 2026-09-03: 소유자 없는 레거시 서버 콘텐츠는 어떤 사용자에게도 연결하지 않고 격리 유지.
- 2026-09-03: 게스트 동기화는 전용 배치 API와 계정별 import receipt로 멱등 처리.
- 2026-09-03: 앱의 기존 순수 RN 마이그레이션 변경과 겹치는 파일은 수정하되 사용자 변경 전체를 임의 커밋하지 않음.
- 2026-09-03: 계정 탈퇴는 Lumine 서버 데이터와 해당 계정 로컬 캐시만 삭제하고 소셜 제공자 계정 및 게스트 큐는 유지.
- 2026-09-03: 내보내기는 앱 문서 디렉터리에 UTF-8 JSON 파일을 생성한 뒤 시스템 공유 시트로 전달.
- 2026-09-03: `self_authored_prompt` — 최종 계약 대조에서 동기화 모달이 안전 도움 접근을 가릴 수 있음을 발견. 범위 내 개선으로 안전 도움 바로가기와 비차단 상태 전이를 추가.
- 2026-09-03: 최종 검증 결과 모든 승인된 수용 기준 충족. 추가 개선 루프 없이 완료 결정.

## Known Constraints

- 작업 시작 시점부터 앱 순수 RN 마이그레이션과 `web/` 제거 등 대규모 사용자 변경이 존재한다.
- `JournalModels.kt`의 기존 사용자 변경은 Runner 커밋에서 제외한다.
- 앱 신규 파일 다수가 untracked이고 기존 추적 파일도 사용자 변경과 겹쳐 Runner 전용 커밋으로 안전하게 분리할 수 없다.

## Risk Reports

- PostgreSQL 마이그레이션은 실제 외부 PostgreSQL 인스턴스가 없어 H2 기반 통합 테스트와 SQL 구조 검토까지만 수행했다.
- 동일한 게스트 항목을 동시에 여러 요청으로 가져오는 극단적 경쟁에서는 한 요청이 일시 실패할 수 있으나 재시도 시 멱등 복구된다.
- 실제 기기의 OS 공유 시트에서 JSON 저장 동작은 시뮬레이터 빌드 이후 별도 수동 확인이 필요하다.

## Current Codebase Snapshot

- HEAD: `967966a` (`dev`).
- 서버: 영속 사용자/JWT, 사용자별 콘텐츠 격리, 게스트 가져오기, 내보내기, 계정 삭제 구현 완료.
- 앱: 동의 기반 동기화, 상태·재시도, 계정별 캐시, JSON 파일 내보내기, 탈퇴 UI 구현 및 양 플랫폼 빌드 검증 완료.
- 사용자 소유 dirty worktree는 그대로 유지 중.

## Remaining Known Issues

- Chunk 3~4 앱 변경은 기존 사용자 RN 마이그레이션과 분리 불가능하여 commit blocker 상태다.
- 실제 PostgreSQL에서 Flyway V2/V3 실행과 실제 기기 파일 공유는 출시 전 수동 점검이 필요하다.

## Chunk Commit History

- `fb3ece6` — Chunk 1: 사용자 영속성/JWT 인증. 서버 테스트 통과. 필수 리뷰 이슈 없음.
- `8acbe1b` — Chunk 2: 사용자별 콘텐츠 격리/Flyway 마이그레이션. 서버 11개 테스트 통과. 필수 리뷰 이슈 없음.
- `7d70cce` — Chunk 3 서버: 멱등 게스트 콘텐츠 가져오기/부분 실패. 서버 12개 테스트와 앱 타입 검사 통과. 앱 변경은 commit blocker.
- `967966a` — Chunk 4 서버: 계정별 JSON 내보내기와 전체 데이터 삭제. 서버 13개 테스트, 앱 테스트·양 플랫폼 빌드 통과. 앱 변경은 commit blocker.

## Follow-up Candidates

- 로그인 동시 생성 경쟁 시 unique constraint 충돌을 기존 사용자 재조회로 복구하는 보강.
- 실제 PostgreSQL 환경에서 Flyway V2/V3 smoke test 자동화.

## Final Validation Result

- PASS — 모든 개인 API가 JWT principal을 사용하며 계정별 콘텐츠 격리 테스트를 통과했다.
- PASS — 게스트 기록은 동의 전 자동 전송되지 않고 항목별 멱등·부분 실패·충돌 보존을 지원한다.
- PASS — 동기화 진행·완료·실패 상태와 메뉴 재시도, 모든 상태의 안전 도움 접근을 제공한다.
- PASS — 탈퇴 시 해당 사용자의 일기·마음 확인·import receipt·계정을 삭제하고 소셜 계정과 게스트 큐는 유지한다.
- PASS — 본인 데이터만 UTF-8 JSON으로 직렬화해 파일 공유할 수 있다.
- PASS — 구조 검토에서 새 순환 의존성, 중복 구현, 작업으로 발생한 dead code를 발견하지 못했다.

## Review Summary

- 인증/권한: 필수 이슈 없음.
- 데이터 무결성/삭제: 필수 이슈 없음.
- 동기화/재시도: 최종 개선 1건(안전 도움 접근) 반영 후 필수 이슈 없음.
- 모바일 네이티브 연결: Android 및 iOS 빌드 성공. 서드파티 deprecated API 경고만 존재.
