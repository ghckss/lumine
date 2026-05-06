# App

React Native 셸입니다.

## 현재 상태
- `react-native-webview` 기반 RN 셸이 있습니다.
- `android/`, `ios/` 네이티브 프로젝트 뼈대가 생성되어 있어요.
- 현재 흐름은 `Splash -> PermissionGate -> WebViewContainer`예요.
- 로그인과 프로필 보완 화면은 네이티브에서 먼저 처리해요.
- WebView 하단 탭과 브리지 command registry가 포함되어 있어요.
- WebView 로드 실패 시 앱에서 `109`, `119` 연결 fallback을 보여줘요.

## 요구 사항
- Node.js 18+
- `pnpm`
- Xcode: iOS 실행 시
- Android Studio / Android SDK: Android 실행 시
- Ruby 2.6+ / Bundler: iOS pod 설치 시

## 의존성 설치
```bash
cd /Users/hwanghochan/workspace/lumine/app
pnpm install
```

`react-native-keychain`이 설치되면 세션 저장은 keychain/keystore를 우선 사용하고, 없으면 메모리 fallback으로 동작해요.

카카오/구글 네이티브 로그인 SDK도 의존성에 선언돼 있어요. 기본값은 mock social login fallback이 켜져 있고, 설정 값이 비어 있으면 셸이 mock authorize 결과를 반환해요.

실 로그인 전환 시 아래 값을 먼저 채워야 해요.

- `app/src/config/auth.ts`
- `app/ios/LumineNativeShell/Info.plist`
- `app/android/app/src/main/res/values/strings.xml`

iOS는 추가로 아래 둘 중 하나가 필요해요.

- `GoogleService-Info.plist`를 Xcode 프로젝트에 추가
- 또는 `app/src/config/auth.ts`의 `googleIosClientId`를 채우기

필수 placeholder:

- `YOUR_KAKAO_NATIVE_APP_KEY`
- `YOUR_GOOGLE_WEB_CLIENT_ID`
- `YOUR_GOOGLE_IOS_CLIENT_ID`
- `YOUR_GOOGLE_IOS_REVERSED_CLIENT_ID`

카카오 Android redirect activity와 iOS URL scheme/openURL 처리는 프로젝트에 반영돼 있어요.

## Metro 실행
```bash
cd /Users/hwanghochan/workspace/lumine/app
pnpm start
```

## iOS 실행
최초 1회 pod 설치:
```bash
cd /Users/hwanghochan/workspace/lumine/app
bundle install
cd ios
RUBYOPT=-rlogger bundle exec pod install
cd ..
```

실행:
```bash
cd /Users/hwanghochan/workspace/lumine/app
pnpm ios
```

## Android 실행
```bash
cd /Users/hwanghochan/workspace/lumine/app
pnpm android
```

## 메모
- 현재는 WebView 셸 방향의 1차 구현 상태예요.
- `auth.bootstrap`, `app.stateChanged`, `app.deepLink` 이벤트를 웹으로 전달해요.
- `auth.saveSecure`, `auth.clearSecure`, `support.openHotline`, `external.openUrl` command를 앱에서 받아요.
- Android 13+에서는 `push.requestPermission` 호출 시 알림 권한 요청을 실제로 시도해요.
- `reminder.schedule`은 현재 OS 알림 예약까지는 아니고, 검증된 요청을 앱 내부 저장소에 기록하는 단계예요.
- 로그인 흐름은 `native provider authorize -> server login exchange -> session bootstrap` 구조예요.
- provider별 구현은 `app/src/auth/providers/` 아래에 분리돼 있어요.
- 앱 시작 시 provider initialize를 먼저 호출하고, 로그인/로그아웃은 provider adapter를 통해 처리해요.
- iOS 기본 호스트는 `localhost`, Android 에뮬레이터 기본 호스트는 `10.0.2.2`로 잡혀 있어요.
- 보안 저장소는 `react-native-keychain`이 있으면 실제 저장소를 쓰고, 없으면 fallback이에요.
- iOS는 현재 `RUBYOPT=-rlogger` 기준으로 pod / run-ios를 맞춰둔 상태예요.
- iOS는 현재 Hermes를 끈 상태예요.
- Android는 현재 `newArchEnabled=false`로 맞춰둔 상태예요.
- Android는 `android/local.properties`에 로컬 SDK 경로가 필요해요.
- 실사용 단계로 가려면 `app/src/config/auth.ts`의 `enableMockSocialLogin`을 `false`로 바꾸고, 카카오 앱 키/Google 설정 파일 연결을 마쳐야 해요.

## 스토어 아티팩트
- Android 릴리스 산출물은 `AAB` 기준으로 만들어요.
- iOS 릴리스 산출물은 `xcarchive`, `IPA` 기준으로 만들어요.
- 루트에서 `npm run artifact:android`, `npm run artifact:ios`, `npm run artifact:app` 커맨드를 사용할 수 있어요.
- GitHub Actions의 `.github/workflows/mobile-artifacts.yml`는 `master` push 시 Android AAB와 iOS IPA/xcarchive를 artifact로 저장해요.
- Android 시크릿: `ANDROID_UPLOAD_KEYSTORE_BASE64`, `ANDROID_UPLOAD_STORE_PASSWORD`, `ANDROID_UPLOAD_KEY_ALIAS`, `ANDROID_UPLOAD_KEY_PASSWORD`
- iOS 시크릿: `IOS_BUILD_CERTIFICATE_BASE64`, `IOS_P12_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`, `IOS_KEYCHAIN_PASSWORD`, `IOS_TEAM_ID`, `IOS_PROVISIONING_PROFILE_NAME`
