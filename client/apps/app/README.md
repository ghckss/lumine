# Lumine Mobile

Lumine의 감정 일기, 마음 상태 확인, 마음 리포트와 안전 도움 경험을 제공하는 React Native 앱입니다. WebView가 아니라 Android와 iOS native shell 위에서 실행되며, Kotlin API 서버와 통신하고 게스트·회원 데이터를 기기 보안 저장소에 캐시합니다.

## 기술 구성

- React Native 0.76과 React 18
- TypeScript 5.6과 Vitest 3
- pnpm 11 workspace와 Metro
- Android Gradle Plugin, Java 17, Hermes
- Xcode, CocoaPods, iOS JSC
- `@react-native-google-signin/google-signin`, `@react-native-seoul/kakao-login`
- `react-native-keychain`, `react-native-fs`, `react-native-share`, NetInfo
- workspace package `@lumine/domain`, `@lumine/api-contracts`

Metro는 `metro.config.js`에서 client workspace를 감시하고 app 및 workspace root의 `node_modules`와 package exports를 해석합니다. 이 설정은 monorepo package를 React Native bundle에 포함하기 위해 필요합니다.

## 사전 준비와 설치

공통으로 Node.js 20(CI 기준), Corepack과 저장소에 고정된 pnpm 11이 필요합니다. dependency는 app 폴더가 아니라 client workspace에서 설치합니다.

```bash
corepack enable
pnpm --dir client install --frozen-lockfile
```

Android 개발에는 Java 17, Android SDK, platform/build-tools와 실행 중인 emulator 또는 연결된 device가 필요합니다. 현재 build 설정은 compile SDK 35, target SDK 34, min SDK 24이며 app script는 macOS 기본 SDK 경로인 `$HOME/Library/Android/sdk`를 사용합니다. 다른 경로 또는 운영체제에서는 `ANDROID_HOME`과 `PATH`를 실행 환경에 맞게 설정해야 합니다.

iOS 개발과 archive는 macOS에서만 가능하며 `/Applications/Xcode.app`, Xcode command-line tools, Ruby, Bundler와 CocoaPods가 필요합니다. `Gemfile`은 Ruby 2.6.10 이상과 CocoaPods 호환 범위를 정의합니다.

```bash
cd client/apps/app
bundle install
cd ios
bundle exec pod install
```

`ios` 계열 script는 `iPhone 17 Pro` simulator를 지정합니다. 해당 runtime/device가 없으면 Xcode에서 simulator를 설치·생성하거나 app 폴더에서 React Native CLI에 로컬 simulator 이름을 직접 전달해야 합니다.

## 개발 실행

저장소 루트에서 Metro를 시작합니다.

```bash
pnpm run dev:metro
```

Metro를 유지한 별도 terminal에서 한 플랫폼을 실행합니다.

```bash
pnpm run dev:ios
pnpm run dev:android
```

`dev:ios`와 `dev:android`는 이미 실행 중인 Metro를 재시작하지 않습니다. 서버, Metro, iOS와 Android toolchain을 모두 사용할 수 있다면 다음 명령으로 전체 개발 환경을 실행할 수 있습니다.

```bash
pnpm run dev:all
```

app 폴더에서 `pnpm run ios` 또는 `pnpm run android`를 실행하면 React Native CLI가 Metro 시작도 관리합니다. Android native debug build만 확인하려면 다음 명령을 사용합니다.

```bash
cd client/apps/app/android
./gradlew app:assembleDebug
```

## package script

`client/apps/app/package.json`의 script 8개는 다음과 같습니다.

| 이름 | 실제 command | 용도 |
| --- | --- | --- |
| `dev` | `react-native start` | 개발용 Metro bundler를 시작합니다. |
| `start` | `react-native start` | Metro bundler를 시작합니다. root의 `dev:metro`와 `dev:all`이 이 script를 사용합니다. |
| `test` | `vitest run` | 인접한 `*.test.ts` unit test를 한 번 실행합니다. |
| `typecheck` | `tsc --noEmit` | JavaScript를 생성하지 않고 TypeScript를 검사합니다. |
| `android` | `ANDROID_HOME=$HOME/Library/Android/sdk PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH react-native run-android` | Metro를 포함해 Android app을 설치·실행합니다. |
| `ios` | `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer RUBYOPT=-rlogger react-native run-ios --simulator "iPhone 17 Pro"` | Metro를 포함해 지정 simulator에서 iOS app을 실행합니다. |
| `ios:no-packager` | `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer RUBYOPT=-rlogger react-native run-ios --simulator "iPhone 17 Pro" --no-packager` | 실행 중인 Metro를 사용해 iOS app만 실행합니다. |
| `android:no-packager` | `ANDROID_HOME=$HOME/Library/Android/sdk PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH react-native run-android --no-packager` | 실행 중인 Metro를 사용해 Android app만 실행합니다. |

검증은 저장소 루트에서 실행할 수 있습니다.

```bash
pnpm --dir client --filter @lumine/app run typecheck
pnpm --dir client --filter @lumine/app run test
```

## 폴더 구조와 의존 방향

runtime 진입 경로는 `index.js` → `App.tsx` → `src/app/AppRoot.tsx`입니다. `AppRoot`는 provider를 조합하고 splash, session 복원, 로그인·게스트, profile 설정 gate를 관리합니다. 화면 이동은 React Navigation이 아니라 `src/app/navigation`의 typed stack이 담당합니다.

```text
client/apps/app/
├── index.js                 # React Native component 등록
├── App.tsx                  # AppRoot 연결
├── src/
│   ├── app/
│   │   ├── bootstrap/       # 인증 초기화와 guest content 동기화
│   │   ├── navigation/      # route, stack state와 화면 조합
│   │   └── providers/       # 장기 수명 provider 조합
│   ├── features/
│   │   ├── account/         # profile, data export와 계정 삭제
│   │   ├── auth/            # native provider, session과 인증 API
│   │   ├── home/            # 홈 화면
│   │   ├── journal/         # 감정 일기 API, 상태, cache와 UI
│   │   ├── report/          # 마음 리포트 계산과 UI
│   │   ├── screening/       # 마음 상태 확인 API, 상태, cache와 UI
│   │   └── support/         # 안전 도움과 법적 문서 UI
│   └── shared/
│       ├── api/             # 공통 HTTP client와 JWT 연결
│       ├── config/          # API와 native auth 설정
│       ├── storage/         # secure store, device cache와 pending sync
│       ├── theme/           # design token
│       └── ui/              # 공통 native UI primitive
├── android/                 # Gradle project와 Android native 설정
└── ios/                     # Xcode workspace, project와 CocoaPods 설정
```

의존 방향은 `app → features → shared`입니다. `shared`는 `features`나 `app`을 import하지 않고 feature는 `app`을 import하지 않습니다. 플랫폼 독립 domain 규칙과 API DTO는 각각 `@lumine/domain`, `@lumine/api-contracts`의 public export를 사용합니다.

## API 주소

`src/shared/config/env.ts`가 `LUMINE_API_BASE_URL`을 읽고 Babel이 bundle build 때 이 값만 inline합니다.

- 개발 기본값: iOS는 `http://localhost:8080`, Android emulator는 `http://10.0.2.2:8080`
- 실제 device: device에서 접근 가능한 개발 PC의 주소를 `LUMINE_API_BASE_URL`로 지정
- Release: `LUMINE_API_BASE_URL`에 유효한 HTTPS URL이 반드시 필요하며, 없거나 HTTPS가 아니면 app 초기화가 실패
- CI: `.github/workflows/mobile-artifacts.yml`의 동일한 Repository Variable 사용

환경변수를 바꾼 뒤에는 Metro cache가 아니라 bundle 자체를 다시 빌드해야 합니다. 실제 token, 인증서와 비밀번호는 `.env*`, CI secret 또는 운영 credential store에서 관리하고 source와 README에 기록하지 않습니다.

## Google Sign-In 설정

Google Cloud Console에서 플랫폼별 OAuth client를 준비합니다. 실제 client ID와 인증서 fingerprint 값은 이 문서에 기록하지 않습니다.

### Android

1. `android/app/build.gradle`의 `applicationId`와 signing certificate의 SHA-1 fingerprint로 Android OAuth client를 등록합니다.
2. 로컬 debug는 저장소의 표준 `android/app/debug.keystore`, 배포본은 release upload/app-signing certificate를 사용하므로 각 인증서의 fingerprint를 console에 등록합니다.
3. ID token 발급에 사용할 runtime web client ID는 `src/shared/config/auth.ts`의 `googleWebClientId`에 설정합니다. `GoogleSignin.configure`가 이 값을 사용하며, 발급된 ID token의 `aud`는 서버 검증 대상입니다. `android/app/src/main/res/values/strings.xml`의 `google_web_client_id`는 별도의 native resource이므로 credential을 교체할 때 함께 용도와 소비 경로를 점검하되, 두 값을 동일한 설정으로 간주하지 않습니다.

### iOS

1. Xcode project의 `PRODUCT_BUNDLE_IDENTIFIER`와 일치하는 iOS OAuth client를 등록합니다.
2. iOS client ID와 web client ID를 `src/shared/config/auth.ts` 및 `ios/LumineNativeShell/Info.plist`의 대응 항목에 일치시킵니다.
3. iOS client ID의 reversed client ID를 `Info.plist` URL scheme에 등록합니다.
4. provider에서 지정한 resource 이름 `GoogleService-Info`로 조회할 수 있도록 해당 `.plist`를 Xcode app target에 추가합니다. credential/config file은 안전한 로컬 또는 CI 경로에서 주입하고 Git에 추가하지 않습니다.

앱은 Google ID token을 서버에 전달합니다. 서버의 `GOOGLE_CLIENT_IDS`에는 이 token의 실제 `aud`를 허용해야 하며, 현재 native 흐름에서는 `googleWebClientId`가 그 audience입니다.

## Kakao Login 설정

Kakao Developers console과 native project를 다음 관계로 맞춥니다. 실제 native app key와 key hash는 source 문서에 복사하지 않습니다.

### Android

1. `android/app/build.gradle`의 `applicationId`를 Android package로 등록합니다.
2. debug와 release signing certificate에서 각각 생성한 Kakao key hash를 등록합니다.
3. native app key를 `src/shared/config/auth.ts`와 `android/app/src/main/res/values/strings.xml`의 대응 항목에 설정합니다.
4. `AndroidManifest.xml`의 login callback은 Android string resource의 `kakao{NATIVE_APP_KEY}` scheme을 사용하므로 native app key를 바꿀 때 함께 갱신합니다.

### iOS

1. Xcode project의 `PRODUCT_BUNDLE_IDENTIFIER`를 iOS bundle ID로 등록합니다.
2. native app key를 `src/shared/config/auth.ts`와 `ios/LumineNativeShell/Info.plist`의 대응 항목에 일치시킵니다.
3. `Info.plist`의 callback URL scheme을 `kakao{NATIVE_APP_KEY}` 형식으로 유지하고 Kakao SDK가 조회하는 scheme 목록을 보존합니다.

서버의 `KAKAO_APP_IDS`는 native app key가 아닙니다. Kakao token-info endpoint가 access token에 대해 반환하는 숫자형 `app_id`를 허용 목록에 넣어야 합니다.

## Mock login 조건

client mock provider fallback은 단순히 debug build라는 이유만으로 항상 동작하지 않습니다.

- `src/shared/config/auth.ts`의 `enableMockSocialLogin`이 `__DEV__`일 때만 true입니다.
- Kakao는 native app key가 비어 있고 SDK login이 실패한 경우에만 mock payload로 fallback합니다.
- Google은 web client ID와 iOS client ID가 모두 비어 있고 SDK 초기화 또는 login이 실패한 경우에만 fallback합니다.
- mock payload를 서버가 받아들이려면 로컬 서버도 `AUTH_MOCK_LOGIN_ENABLED=true`여야 합니다.

현재 source에 provider 식별자가 설정되어 있으면 SDK 오류는 mock으로 숨겨지지 않고 로그인 실패로 처리됩니다. Release에서는 `__DEV__`가 false이므로 mock fallback을 사용할 수 없습니다. 운영 서버에서는 `AUTH_MOCK_LOGIN_ENABLED`를 반드시 비활성화합니다.

## Signing과 배포 credential

Android debug build는 저장소가 추적하는 표준 `android/app/debug.keystore`를 사용합니다. Release signing은 다음 네 환경변수가 모두 있을 때 별도 upload keystore를 사용합니다.

- `ANDROID_UPLOAD_STORE_FILE`
- `ANDROID_UPLOAD_STORE_PASSWORD`
- `ANDROID_UPLOAD_KEY_ALIAS`
- `ANDROID_UPLOAD_KEY_PASSWORD`

현재 Gradle 설정은 값이 없으면 release build도 debug signing으로 fallback합니다. 이는 로컬 build 편의를 위한 동작이며 스토어 배포 artifact로 사용할 수 없습니다. release keystore, password와 Google/Kakao release fingerprint는 저장소 밖에서 관리합니다.

iOS archive/export에는 Apple distribution certificate, private key, provisioning profile과 development team 설정이 필요합니다. CI는 `IOS_BUILD_CERTIFICATE_BASE64`, `IOS_P12_PASSWORD`, `IOS_PROVISIONING_PROFILE_BASE64`, `IOS_KEYCHAIN_PASSWORD`, `IOS_TEAM_ID`, `IOS_PROVISIONING_PROFILE_NAME` secret을 사용합니다. 인증서, `.p12`, provisioning profile과 임시 keychain은 Git에 저장하지 않습니다.
