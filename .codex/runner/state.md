# Runner State Store

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

## Validation Logs

- Chunk 1: Spring Boot 테스트 통과.
- Chunk 2: Spring Boot 11개 테스트 통과, `git diff --check` 통과.
- Chunk 3: Spring Boot 12개 테스트 통과, 앱 `pnpm exec tsc --noEmit` 통과, `git diff --check` 통과.

## Decision Records

- 2026-09-03: Gate 1 요구사항 계약 승인.
- 2026-09-03: Gate 2 구현 계획 승인, Implementation Autopilot 시작.
- 2026-09-03: 소유자 없는 레거시 서버 콘텐츠는 어떤 사용자에게도 연결하지 않고 격리 유지.
- 2026-09-03: 게스트 동기화는 전용 배치 API와 계정별 import receipt로 멱등 처리.
- 2026-09-03: 앱의 기존 순수 RN 마이그레이션 변경과 겹치는 파일은 수정하되 사용자 변경 전체를 임의 커밋하지 않음.

## Known Constraints

- 작업 시작 시점부터 앱 순수 RN 마이그레이션과 `web/` 제거 등 대규모 사용자 변경이 존재한다.
- `JournalModels.kt`의 기존 사용자 변경은 Runner 커밋에서 제외한다.
- 앱 신규 파일 다수가 untracked이고 기존 추적 파일도 사용자 변경과 겹쳐 Runner 전용 커밋으로 안전하게 분리할 수 없다.

## Risk Reports

- PostgreSQL 마이그레이션은 실제 외부 PostgreSQL 인스턴스가 없어 H2 기반 통합 테스트와 SQL 구조 검토까지만 수행했다.
- 동일한 게스트 항목을 동시에 여러 요청으로 가져오는 극단적 경쟁에서는 한 요청이 일시 실패할 수 있으나 재시도 시 멱등 복구된다.

## Current Codebase Snapshot

- HEAD: `8acbe1b` (`dev`).
- 서버: 영속 사용자/JWT, 사용자별 일기·마음 확인 격리 구현 완료.
- Chunk 3 작업: 서버 content import API와 앱 동의·상태 UI 구현 및 검증 완료, 커밋 전.
- 사용자 소유 dirty worktree는 그대로 유지 중.

## Remaining Known Issues

- Chunk 3 앱 변경은 기존 사용자 RN 마이그레이션과 분리 불가능하여 commit blocker 상태다.
- 계정 삭제·내보내기 및 관련 앱 화면은 Chunk 4에서 구현 예정.

## Chunk Commit History

- `fb3ece6` — Chunk 1: 사용자 영속성/JWT 인증. 서버 테스트 통과. 필수 리뷰 이슈 없음.
- `8acbe1b` — Chunk 2: 사용자별 콘텐츠 격리/Flyway 마이그레이션. 서버 11개 테스트 통과. 필수 리뷰 이슈 없음.

## Follow-up Candidates

- 로그인 동시 생성 경쟁 시 unique constraint 충돌을 기존 사용자 재조회로 복구하는 보강.
- 실제 PostgreSQL 환경에서 Flyway V2/V3 smoke test 자동화.
