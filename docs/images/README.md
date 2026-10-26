# README 화면 캡처

이 디렉터리는 공개 저장소 README에서 사용하는 실제 실행 화면만 보관합니다. 개인 계정, token, 이메일, 실제 일기와 사용자 데이터가 보이는 이미지는 커밋하지 않습니다.

## 현재 캡처

| 파일               | 화면             | 캡처 기준                                       |
| ------------------ | ---------------- | ----------------------------------------------- |
| `web-journal.jpg`  | 감정 일기 작성   | Next.js production build, 빈 익명 브라우저 상태 |
| `web-check.jpg`    | 마음 상태 확인   | Next.js production build, 첫 문항               |
| `web-report.jpg`   | 기간별 리포트    | 익명 예시 일기 1개와 마음 확인 결과 1개         |
| `web-settings.jpg` | 설정·데이터 관리 | 기본 익명 profile, 개인 식별 정보 없음          |

## 모바일 캡처 추가 목록

모바일과 웹을 같은 기능 기준으로 비교하려면 iOS simulator 또는 Android emulator에서 아래 파일을 추가합니다.

- `app-journal.jpg`: 감정 선택과 본문 입력이 함께 보이는 작성 화면
- `app-check.jpg`: 진행률과 응답 선택지가 보이는 마음 상태 확인 화면
- `app-report.jpg`: 예시 데이터만 포함한 주간 또는 월간 리포트
- `app-settings.jpg`: 계정 식별 정보가 보이지 않는 데이터 관리 화면

권장 조건은 390×844pt 계열 simulator, demo/guest profile, 알림·상태바의 개인 정보 제거입니다. 캡처 전 앱의 기존 계정 session과 실제 cache를 비우고, 저장소에 넣기 전에 이미지 metadata와 화면 내 식별 정보를 다시 확인합니다.
