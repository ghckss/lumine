# Lumine Repository Instructions

## Scope and instruction precedence

- This file defines repository-wide rules.
- Before changing files under `server/` or `client/`, read the nearest nested `AGENTS.md`. Deeper instructions add area-specific rules and take precedence for that subtree.
- Keep repository-wide guidance here. Keep framework and service details in their owning directory rather than duplicating them at the root.
- Treat `README.md`, package manifests, build files, and CI workflows as source-of-truth evidence when documentation disagrees with executable configuration.

## Repository map

- `server/`: Spring Boot 3 and Kotlin API, built and deployed independently.
- `client/`: pnpm 11 workspace orchestrated by Turborepo.
  - `apps/app/`: React Native 0.76 mobile application for Android and iOS.
  - `apps/web/`: Next.js 16 App Router web application.
  - `packages/domain/`: platform-independent domain types, constants, and calculations.
  - `packages/api-contracts/`: client-side API DTOs, API errors, and sync/export helpers.
- `infra/`: Terraform AWS infrastructure and Kubernetes base/production overlays.
- `scripts/`: local development, artifact, and deployment entry points.
- `docs/`: deployment notes, patch notes, and forward-looking product material. Do not treat future plans as implemented behavior.

## Cross-project boundaries

- Keep `server`, `apps/app`, and `apps/web` independently buildable. Put genuinely shared client logic in `client/packages`, not in one app for the other app to import.
- Preserve server wire contracts deliberately. When an endpoint DTO changes, inspect the server controller/model, `@lumine/api-contracts`, and both client consumers.
- Do not introduce React, React Native, Next.js, browser, Node.js, or native-platform dependencies into shared packages.
- Preserve authentication, guest-content migration, device-cache keys, API paths, and persisted data shapes unless the task explicitly authorizes a migration.
- Keep secrets and real credentials out of source, logs, examples, and commits. Use documented environment-variable names and redacted placeholders.

## Working rules

- Inspect the relevant implementation, tests, package scripts, and nearest `AGENTS.md` before editing.
- Make the smallest coherent change. Do not combine feature work with unrelated cleanup, dependency upgrades, formatting sweeps, or deployment.
- Preserve unrelated user changes in a dirty worktree. Never use destructive Git cleanup to make a task easier.
- Search with `rg`/`rg --files`. Follow existing naming, error-handling, and testing patterns instead of adding parallel abstractions.
- Add or update tests when behavior, persistence, authorization, API contracts, or domain calculations change.
- Do not run deploy, publish, release, infrastructure apply, signing, or credential-management commands unless the user explicitly requests that external effect.

## Commands and validation

Run commands from the repository root unless a command includes a subshell.

- Install client dependencies: `pnpm --dir client install --frozen-lockfile`
- Full client checks: `pnpm --dir client run check`
- Mobile checks: `pnpm --dir client --filter @lumine/app run typecheck` and `pnpm --dir client --filter @lumine/app run test`
- Web checks: `pnpm --dir client --filter @lumine/web run typecheck`, `pnpm --dir client --filter @lumine/web run lint`, and `pnpm --dir client --filter @lumine/web run build`
- Server tests: `(cd server && gradle test)` with Java 17 and Gradle 8.x. The server currently has no Gradle wrapper.
- Local server: `npm run dev:server`; local web: `npm run dev:web`; Metro: `npm run dev:metro`
- Combined mobile launch: `npm run dev:all` starts the server and Metro, then launches iOS and Android. Use it only when both native toolchains are available.

Choose validation proportional to the changed area. Shared-package or API-contract changes require both app and web type checks plus relevant server tests. Native configuration changes require an actual platform build when the toolchain is available. Always report commands that could not be run and the resulting residual risk.

## Infrastructure and generated files

- Treat Flyway migrations as append-only once committed; do not rewrite production migration history.
- Keep Terraform state, local `.env*`, production signing credentials/artifacts, and generated build output untracked. The repository intentionally tracks the standard Android `debug.keystore`; never replace it with release credentials.
- Validate Terraform with `terraform fmt -check -recursive` and `terraform validate` from `infra/aws` after initialization.
- Validate Kubernetes manifests with `kubectl kustomize infra/k8s/base` and `kubectl kustomize infra/k8s/overlays/production`.
- Do not hand-edit lockfiles, generated native build output, `.next`, `.turbo`, Gradle caches, or `node_modules`.
