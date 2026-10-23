# Lumine React Native App Instructions

## Architecture and dependency direction

- The runtime entry path is `index.js` -> `App.tsx` -> `src/app/AppRoot.tsx`.
- `src/app` owns bootstrap, provider composition, and navigation orchestration.
- `src/features/<domain>` owns vertical feature code, normally split into `api`, `model`, `services`, `storage`, and `ui` as needed.
- `src/shared` owns platform-wide API transport, configuration, secure/device storage primitives, theme tokens, and reusable UI.
- `shared` must not import from `features` or `app`; features must not import from `app`. Keep cross-feature dependencies deliberate and prefer a feature's public `index.ts` when it exports the needed surface.
- Do not recreate removed legacy top-level `screens`, `components`, `context`, `storage`, or `lib` structures. Place new code in the owning feature or shared layer.

## Composition and navigation

- This app uses its own typed stack in `src/app/navigation`, not React Navigation. Add route names/params in `routes.ts`, state behavior in `navigation-state.ts`, and screen composition in `AppNavigator.tsx`.
- `AppRoot` owns splash/auth/profile gating. `AppProviders` and feature providers own long-lived state; screens should not create parallel global sources of truth.
- Preserve stack/reset/back behavior and test route/state helpers when changing navigation. Verify the Android system-back and on-screen back paths relevant to the change.
- Keep feature UI focused on rendering and user interaction. Put orchestration, persistence, and mapping logic into model/service/storage modules where it can be tested without rendering RN views.

## Authentication, storage, and sync

- Auth API/provider logic lives in `features/auth`; provider SDK configuration lives in `src/shared/config/auth.ts` plus native iOS/Android configuration.
- Shared API authorization is configured through `src/shared/api/http-client.ts`. Do not create feature-local token stores.
- Guest journal/screening data, session data, and the pending-sync queue use secure device storage. Existing cache keys and serialized shapes are compatibility surfaces; changing them requires an explicit migration and regression tests.
- Preserve guest-to-account content reconciliation and per-user provider reset behavior. Never log access tokens, provider tokens, journal bodies, or stored credentials.
- `react-native-keychain` is the native store. The in-memory fallback supports non-native/test contexts and is not a durable replacement.

## API, domain, and UI rules

- Feature API modules call the shared `request` helper and reuse `@lumine/api-contracts` DTOs.
- Reuse `@lumine/domain` for shared emotions, dates, greetings, screening/report calculations, and types. Do not fork these rules inside screens.
- Reuse `src/shared/theme/tokens.ts` and `src/shared/ui` primitives. Preserve accessibility labels, minimum touch targets, loading/error states, and Korean user-facing copy conventions.
- Development defaults use `localhost:8080` on iOS and `10.0.2.2:8080` on Android. Release builds require a valid HTTPS `LUMINE_API_BASE_URL`.

## Native and Metro constraints

- The pnpm workspace places dependencies outside the app directory. Preserve the workspace `watchFolders`, `nodeModulesPaths`, and package-exports support in `metro.config.js` unless a replacement is runtime-tested.
- Native dependency or provider changes may require updates to CocoaPods, Xcode project settings, Android Gradle files, manifests, URL schemes, or resource strings. Keep iOS and Android configuration aligned.
- Do not edit generated Android/iOS build output or dependency contents under `node_modules`/Pods.

## Tests and validation

- Unit tests use Vitest and live beside the model/service/storage/navigation code they cover.
- Typecheck: `pnpm --dir client --filter @lumine/app run typecheck`
- Tests: `pnpm --dir client --filter @lumine/app run test`
- Metro: `pnpm --dir client --filter @lumine/app run start`
- Android debug build: `(cd client/apps/app/android && ./gradlew app:assembleDebug)`
- iOS and Android launch scripts are `npm run dev:ios` and `npm run dev:android` when Metro is already running.
- For navigation, persistence, native-module, or Metro changes, perform an actual simulator/emulator launch when the toolchain is available; compilation and unit tests alone are insufficient.
