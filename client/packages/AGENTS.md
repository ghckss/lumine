# Shared Client Package Instructions

## Package responsibilities

- `domain` contains platform-independent types, constants, date/report/journal/screening calculations, and other pure domain rules.
- `api-contracts` contains client-side API payload/response types, `ApiError`, retry classification, guest-sync reconciliation, and data-export serialization.
- Public package surfaces are exported from each package's `src/index.ts`. Consumers must import `@lumine/domain` or `@lumine/api-contracts`, not internal source paths.

## Hard boundaries

- Do not import React, React Native, Next.js, browser globals, native modules, UI code, app stores/providers, or server implementation classes.
- Prefer deterministic pure functions. If time is relevant, accept a date/time input or reuse existing domain date helpers so tests remain stable.
- `api-contracts` may depend on `domain`; `domain` must not depend on `api-contracts` or either application.
- Keep wire DTOs aligned with server request/response models, including optionality, casing, version fields, and enum/string values.
- A package export is a shared compatibility surface. Search both applications before renaming or removing it.

## Testing and validation

- Add focused unit tests for non-trivial domain calculations, reconciliation, serialization, and edge cases. The current Vitest harness lives in `@lumine/app`, where shared-package behavior is imported and tested directly; do not invent a package-local test command unless the task explicitly adds that harness.
- Run package type checks plus both consumer type checks after any exported-type or function change:
  - `pnpm --dir client --filter @lumine/domain run typecheck`
  - `pnpm --dir client --filter @lumine/api-contracts run typecheck`
  - `pnpm --dir client --filter @lumine/app run typecheck`
  - `pnpm --dir client --filter @lumine/web run typecheck`
- For API contract changes, also run the relevant server tests and verify the matching controller/model definitions.
