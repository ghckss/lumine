# Lumine Mobile

Lumine의 전체 사용자 경험을 제공하는 React Native 앱입니다. WebView나 원격 웹 UI에 의존하지 않습니다.

## 화면 구조

- Splash / Welcome / 카카오·Google 네이티브 로그인
- 프로필 설정
- 홈과 최근 감정 요약
- 마음 상태 확인 질문 / 일반 결과 / 안전 결과
- 감정 일기 작성 / 저장 위로 / 기록 목록 / 기록 상세
- 안전 도움과 긴급전화 연결
- 메뉴 / 이용약관 / 개인정보처리방침

앱 내 화면 전환은 `src/screens/native/AppNavigator.tsx`, 사용자 콘텐츠 상태와 로컬 캐시는 `src/context/AppContext.tsx`에서 관리합니다.

회원 데이터는 Kotlin API 서버에 저장하고 기기에 함께 캐시합니다. 게스트 데이터는 보안 기기 저장소에 보관하며, 로그인하면 동기화 대기 항목을 서버로 전송합니다.

## 실행

```bash
pnpm install
pnpm start
pnpm ios
pnpm android
```

iOS 최초 실행 시 `bundle exec pod install`이 필요합니다.

## 인증 설정

카카오와 Google SDK 설정은 다음 위치에서 관리합니다.

- `src/config/auth.ts`
- `ios/LumineNativeShell/Info.plist`
- `android/app/src/main/res/values/strings.xml`

개발 기본값은 mock social login fallback입니다. 실서비스에서는 provider 키와 URL scheme을 설정하고 `enableMockSocialLogin`을 비활성화해야 합니다.

## API

iOS 시뮬레이터는 `localhost:8080`, Android 에뮬레이터는 `10.0.2.2:8080`을 사용합니다. 설정은 `src/config/env.ts`에 있습니다.
