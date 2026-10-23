# Lumine Web Instructions

## Architecture

- This is a Next.js 16 App Router application. Before changing Next.js behavior, follow the version-specific documentation rule in the managed block below.
- Keep route `page.tsx` files thin. Route-specific interactive UI lives in adjacent `_components/*Screen.tsx` files.
- Add `"use client"` only to components that require hooks, browser APIs, Jotai, or event handlers. Keep server-compatible route/layout modules free of unnecessary client boundaries.
- Global composition belongs in `src/app/layout.tsx` and `src/components/AppProviders.tsx`. Reusable visual chrome belongs in `src/components`.
- Browser-persisted product state is owned by Jotai atoms in `src/store/lumineStore.ts` and hydrated through `StorageHydrator`. Preserve the `lumine.web.v1` storage shape or provide an explicit migration.
- Server communication goes through `src/api/client.ts`; environment parsing stays in `src/config/env.ts`. Reuse types from `@lumine/domain` and `@lumine/api-contracts` instead of declaring parallel wire types.

## UI and data rules

- Preserve the existing Moonlight Sanctuary visual language and tokens in `globals.css`; avoid introducing a competing component or styling system for isolated changes.
- Keep accessibility semantics, keyboard interaction, focus behavior, page metadata, loading/error states, and responsive layouts intact.
- Do not access `localStorage`, `window`, or other browser-only APIs during server rendering.
- Do not silently fall back to fabricated API success. Surface `ApiConfigurationError` and `ApiError` consistently with existing UI patterns.

## Validation

- Typecheck: `pnpm --dir client --filter @lumine/web run typecheck`
- Lint: `pnpm --dir client --filter @lumine/web run lint`
- Formatting check: `pnpm --dir client --filter @lumine/web run format:check`
- Production build: `pnpm --dir client --filter @lumine/web run build`
- For shared-package changes, also typecheck the mobile app and affected packages.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
