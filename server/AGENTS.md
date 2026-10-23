# Lumine Server Instructions

## Runtime and layout

- The server is Spring Boot 3.3 with Kotlin, Java 17, Gradle 8.x, Spring Security, JPA, Flyway, H2, and PostgreSQL.
- Organize production code by domain under `src/main/kotlin/com/lumine/server`: `auth`, `journal`, `screening`, `support`, `user`, and `contentimport`.
- Keep cross-domain infrastructure narrow: `global` owns shared API/security configuration, `common` owns small neutral utilities, and `openai` owns the external OpenAI client.
- Follow the existing Controller -> Service -> Repository/Entity flow. Controllers translate HTTP concerns; services own business rules and transaction boundaries; repositories own persistence queries.

## API and security invariants

- Return successful JSON through `ApiResponse<T>` so clients continue to receive `{ "data": ... }`.
- Validate request DTOs with Jakarta validation and use typed request/response models. Do not expose JPA entities directly.
- Authenticated endpoints receive `AuthenticatedUser` through `@AuthenticationPrincipal`; every user-owned query and mutation must remain scoped by `userId`.
- Public routes are intentionally limited in `SecurityConfig`: health, provider login, screening questionnaire, and support resources. Treat changes to that list as security-sensitive.
- Authentication is stateless JWT. Never log provider tokens, JWTs, OpenAI keys, personal journal bodies, or exported user data.
- Preserve HTTP semantics already used by clients, including `409 CONFLICT` for optimistic-concurrency failures.

## Persistence and external services

- Put transaction boundaries on service methods. Mark read-only operations with `@Transactional(readOnly = true)` where appropriate.
- Preserve optimistic locking/version checks for journal mutations and content-import idempotency.
- PostgreSQL schema changes belong in a new, monotonically numbered file under `src/main/resources/db/migration/postgresql/`. Never edit an applied Flyway migration.
- H2 is the default local/test database; PostgreSQL behavior belongs in the `postgres` profile. Consider differences in SQL, constraints, and migrations.
- Keep OpenAI-backed generation behind the existing generator interfaces and retain deterministic fallbacks. Do not make core API availability depend silently on an external model call.

## Tests and validation

- Put integration and security tests under `src/test/kotlin/com/lumine/server` using the existing Spring Boot test patterns.
- Authorization, user isolation, provider verification, content import, migrations, and destructive account operations require regression coverage.
- Run `(cd server && gradle test)` with Java 17 and Gradle 8.x. There is no server Gradle wrapper.
- For local runtime verification, `npm run dev:server` downloads the pinned Gradle 8.10.2 distribution into `/tmp` when needed and starts port `8080`.
- Useful health/readiness checks are `GET /actuator/health` and `GET /api/screening/questionnaire`.

## Change discipline

- Coordinate endpoint or DTO changes with `client/packages/api-contracts` and all consuming app/web API clients.
- Do not weaken authentication, CORS, validation, user scoping, or data deletion behavior to simplify a test.
- Keep environment-specific values in configuration and environment variables; do not add production secrets or machine-specific absolute paths.
