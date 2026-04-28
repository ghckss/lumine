# App

React Native 셸입니다.

## 현재 상태
- `react-native-webview` 기반 셸 초안만 있습니다.
- 현재 저장소에는 `ios/`, `android/` 네이티브 프로젝트 디렉터리가 없습니다.
- 그래서 지금 상태 그대로는 `run-ios`, `run-android`가 바로 성공하지 않을 수 있습니다.

## 요구 사항
- Node.js 18+
- npm 또는 pnpm
- Xcode: iOS 실행 시
- Android Studio / Android SDK: Android 실행 시

## 의존성 설치
```bash
cd /Users/hwanghochan/workspace/melancholy/app
npm install
```

## Metro 실행
```bash
cd /Users/hwanghochan/workspace/melancholy/app
npm start
```

## iOS 실행
네이티브 프로젝트가 준비된 뒤 실행합니다.
```bash
cd /Users/hwanghochan/workspace/melancholy/app
npm run ios
```

## Android 실행
네이티브 프로젝트가 준비된 뒤 실행합니다.
```bash
cd /Users/hwanghochan/workspace/melancholy/app
npm run android
```

## 메모
- 현재는 WebView 셸 방향의 초안입니다.
- 실사용 단계로 가려면 `ios/`, `android/` 프로젝트 생성과 브리지 구현이 추가로 필요합니다.
