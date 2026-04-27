# 디자인 명세

```json
{
  "summary": "React Native 셸(최소 네이티브) + Next.js WebView(기능 중심) 구조에서 우울감 자가선별과 마음일기 MVP를 구현 가능한 화면/상태/판별 규칙으로 구체화한다.",
  "targets": [
    "RN 책임: 푸시 알림, 딥링크, WebView 브리지, 권한 처리, 보안 저장소(토큰/플래그)만 담당하고 도메인 UI는 WebView로 위임한다.",
    "Web 책임: Next.js App Router 기반 라우트(/auth, /home, /screening, /journal, /insights, /settings, /crisis)와 Zustand 전역상태, TanStack Query 서버상태를 표준화한다.",
    "인증 소유권: Web-first 인증을 기본으로 하고 RN은 세션 동기화 브리지와 만료/로그아웃 이벤트만 처리한다.",
    "기획 산출물 1: 우울 관련 유형 비교표(주요우울장애, 지속성 우울장애, 계절성 양상, 주산기 발병, 양극성 우울삽화 감별 필요)를 차이점/기간/특징/주의사항 기준으로 정리한다.",
    "기획 산출물 2: PHQ-9 기반 문항 + 감별 보조문항(조증/경조증 경고)으로 질문 세트를 정의한다.",
    "판별 규칙: PHQ-9 총점 구간(0-4, 5-9, 10-14, 15-19, 20-27)과 문항 9(자해 사고) 별도 위험 플래그를 조합해 결과 단계를 생성한다.",
    "안전 정책: 의료 진단 아님 고지, 고위험 응답 시 즉시 위기 대응 안내(긴급 연락/지역 기관/신뢰 인물 연락 CTA)를 필수 플로우로 포함한다.",
    "MVP 우선순위: 1) 선별 플로우 2) 마음일기 CRUD 3) 결과/가이드 4) 알림 리마인더, 이후 확장으로 통계 인사이트/개인화 코칭을 분리한다."
  ],
  "layoutChanges": [
    "RN 앱 껍데기: Splash -> PermissionGate -> WebViewContainer(기본) + NativeModal(CrisisFallback, 네트워크 오류, 앱 업데이트 안내) 구조로 설계한다.",
    "Web /screening/start: 도구 고지 카드, 소요시간, 시작 CTA를 상단 고정 액션으로 배치한다.",
    "Web /screening/questions: 단일 문항 카드 + 0~3 응답 버튼군 + 진행률 바 + 이전/다음 네비게이션을 사용한다.",
    "Web /screening/result: 점수 요약, 위험도 배지, 권장 다음 행동(자가관리/전문가 상담/즉시 도움) 섹션을 분리한다.",
    "Web /journal: 오늘 기분 체크 인라인 컴포넌트, 마음일기 에디터, 최근 기록 타임라인 3단 레이아웃(모바일에서는 순차 스택)으로 구성한다.",
    "Web /insights: 주간/월간 변화 그래프, 트리거 태그 분포, 회복 행동 체크리스트를 카드 그리드로 배치한다.",
    "Web 공통: App Router의 nested layout으로 상단 상태영역, 본문, 하단 고정 CTA 슬롯을 재사용한다.",
    "Preserve the existing information architecture unless the command explicitly asks for a layout change."
  ],
  "visualRules": [
    "Tailwind 디자인 토큰을 정의한다(--color-safe, --color-caution, --color-risk, --surface, --text) 그리고 위험도 색상은 텍스트/아이콘/배경에 일관 적용한다.",
    "선별 문항 화면은 인지부하를 줄이기 위해 단일 초점(한 번에 한 질문), 큰 터치 타깃, 강한 선택 상태 대비를 유지한다.",
    "의료적 확정 표현을 금지하고 결과 카피는 '가능성/권장' 중심의 비진단 문구로 통일한다.",
    "Zustand 슬라이스별 UI 규칙을 분리한다(authSlice, screeningSlice, journalSlice, uiSlice) 및 컴포넌트는 프레젠테이션/컨테이너로 분리한다.",
    "TanStack Query 키 규칙을 고정한다(['screening','history'], ['journal','entries',date], ['insights','weekly']) 및 로딩 스켈레톤 스타일을 공통화한다.",
    "애니메이션은 페이지 진입 페이드+슬라이드(150-220ms)만 사용하고 위기 안내 화면은 즉시 표시(모션 최소화)한다.",
    "Match the existing visual language of the repository.",
    "Keep spacing, hierarchy, and affordances consistent across affected screens."
  ],
  "interactionStates": [
    "초기 진입: RN이 브리지 핸드셰이크 후 Web 세션 상태를 확인하고 미인증이면 /auth, 인증이면 /home으로 라우팅한다.",
    "선별 진행 상태: idle -> in_progress -> scored -> risk_triage -> completed 상태머신으로 관리하고 각 단계는 Zustand에 저장한다.",
    "응답 저장: 문항 응답은 로컬 임시저장(중단 복귀 가능) 후 제출 시 TanStack Query mutation으로 서버 동기화한다.",
    "판별 로직: PHQ-9 총점 계산 + 문항9>0이면 high-risk 플래그 우선 적용, 필요 시 결과 화면 대신 /crisis로 즉시 분기한다.",
    "오류 처리: 네트워크 실패 시 재시도/오프라인 안내를 표시하고 제출 중 중복 탭 방지를 위해 버튼을 disable 처리한다.",
    "마음일기 상태: draft/autosaved/submitted/failed 상태를 분리하고 자동저장은 디바운스(예: 800ms)로 수행한다.",
    "알림 상호작용: RN 로컬 알림 탭 시 딥링크로 /journal/new 또는 /screening/start를 열고 마지막 미완료 단계로 복원한다.",
    "Cover loading, error, empty, and success states when the UI already supports them."
  ],
  "accessibilityChecks": [
    "모든 텍스트/아이콘 대비를 WCAG 2.1 AA(일반 텍스트 4.5:1 이상) 기준으로 검증한다.",
    "문항 선택 버튼은 스크린리더 라벨(문항 번호, 선택값, 현재 선택 여부)을 제공하고 포커스 순서를 논리적으로 유지한다.",
    "위기 대응 CTA(전화/도움 요청)는 최소 44x44pt 터치 영역과 명확한 동사형 라벨을 보장한다.",
    "결과 화면의 위험도는 색상만으로 전달하지 않고 텍스트 배지/아이콘/설명문을 함께 제공한다.",
    "Dynamic Type(글자 확대)에서 문항/버튼 잘림이 없도록 줄바꿈과 최소 높이 규칙을 적용한다.",
    "모션 축소 환경설정(prefers-reduced-motion)에서 전환 애니메이션을 제거하거나 단축한다.",
    "Maintain readable contrast, labels, and keyboard-reachable controls."
  ],
  "responsiveNotes": [
    "WebView UI는 모바일 우선(360px 기준)으로 설계하고 768px 이상에서 카드 폭/그리드를 확장한다.",
    "RN Safe Area inset 값을 CSS 변수로 전달해 Web 상단/하단 패딩에 반영한다.",
    "모바일 키보드 오픈 시 하단 CTA가 입력창을 가리지 않도록 sticky 영역과 viewport 높이(calc with dvh)를 사용한다.",
    "태블릿에서는 /journal과 /insights에 2열 레이아웃을 허용하되 선별 질문 화면은 단일 열을 유지한다.",
    "가로 모드에서는 진행률/네비게이션을 상단 고정하고 본문 스크롤 영역을 분리해 조작 안정성을 확보한다.",
    "저성능 기기 대응으로 그래프/리치 컴포넌트는 지연 로딩하고 초기 화면은 핵심 액션 우선 렌더링한다.",
    "Repository scripts available for validation: none"
  ]
}
```
