# Runner State Store

## Active Workflow — 2.2 작성 안정성

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

- HEAD: `a0d8fda` on `dev`; 작업 시작점은 `499670c`.
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
