# Lumine Client Workspace Instructions

## Workspace ownership

- `client` is a pnpm 11 workspace configured by `pnpm-workspace.yaml` and orchestrated by Turborepo.
- `apps/app` and `apps/web` are independent runtime applications. They may consume `packages/*`, but must not import source files from each other.
- `packages/domain` owns platform-independent domain concepts and calculations. `packages/api-contracts` owns shared client-side API DTOs and transport helpers.
- Read the nested `AGENTS.md` for the app, web, or packages subtree before editing there.

## Dependency and package rules

- Use `pnpm` from this workspace; do not run `npm install` or create additional lockfiles.
- Add internal dependencies with `workspace:*`. Do not bypass package exports with relative imports into another workspace package.
- Keep package versions and lockfile changes limited to tasks that actually change dependencies.
- Avoid duplicating domain types in both clients. Promote code to a shared package only when it is truly platform-neutral and used, or imminently used, by multiple clients.
- Do not add a shared abstraction merely to make app and web implementations look identical; their UI, navigation, storage, and runtime constraints are intentionally different.

## Commands

- Install: `pnpm --dir client install --frozen-lockfile`
- Develop all client workspaces: `pnpm --dir client run dev`
- Full checks: `pnpm --dir client run check`
- Workspace type checks: `pnpm --dir client run typecheck`
- Workspace tests: `pnpm --dir client run test`
- Workspace lint: `pnpm --dir client run lint` (currently only workspaces defining a lint task participate)

Use filtered commands while iterating, then widen validation when changing shared packages. CI runs web typecheck/lint/build separately from app typecheck/tests.

## Cross-client contract changes

- Changes in `packages/domain` or `packages/api-contracts` require at least app and web type checks.
- Changes to request/response fields or endpoint semantics also require inspection and tests in `server`.
- Preserve exported symbol names and persisted shapes unless the task explicitly includes a coordinated migration.
- Keep environment-variable access inside each app's config module rather than spreading `process.env` reads through features.
