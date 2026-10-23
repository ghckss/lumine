# Lumine Server

Lumine의 계정, 감정 일기, 마음 상태 확인과 사용자 데이터 API를 제공하는 Spring Boot 서버입니다. application의 `/api/**` 성공 응답은 공통 `ApiResponse<T>`를 통해 `{ "data": ... }` 형태로 반환하며, 사용자 소유 데이터는 JWT의 인증 주체를 기준으로 분리합니다. `/actuator/health`는 이 공통 envelope를 사용하지 않고 Actuator 고유 응답을 반환합니다.

## 기술 구성

- Spring Boot 3.3.5
- Kotlin 1.9.25
- Java 17 toolchain
- Gradle 8.x
- Spring Security와 stateless JWT 인증
- Spring Data JPA, H2, PostgreSQL
- Flyway PostgreSQL migration
- Spring Boot Actuator health endpoint
- 선택적인 OpenAI Responses API와 deterministic fallback

이 프로젝트에는 Gradle wrapper(`./gradlew`)가 없습니다. 직접 실행하려면 Java 17과 Gradle 8.x가 필요합니다. 저장소 루트의 개발 script를 사용하면 Gradle 8.10.2를 `/tmp`에 내려받아 사용합니다.

## 빠른 실행

저장소 루트에서 기본 H2 profile로 실행합니다.

```bash
pnpm run dev:server
```

이 script는 서버를 `8080` 포트에서 시작하고, 파일이 있으면 다음 순서로 환경변수를 읽습니다. 뒤에서 읽은 파일이 같은 이름을 덮어씁니다.

1. `.env.local`
2. `server/.env`
3. `server/.env.local`

`pnpm run dev:all`도 같은 서버 script를 사용하며 Metro를 함께 시작한 뒤 iOS와 Android 앱을 실행합니다. 환경변수 파일을 변경했다면 실행 중인 서버를 재시작해야 합니다.

로컬 Gradle을 직접 사용할 수도 있습니다. 직접 실행한 Gradle은 위 환경변수 파일을 자동으로 읽지 않으므로 필요한 값을 shell 또는 실행 환경에서 제공해야 합니다.

```bash
cd server
gradle bootRun
```

## 데이터베이스 profile

### 기본 H2

별도 profile을 지정하지 않으면 PostgreSQL 호환 모드의 H2 in-memory database를 사용합니다. 이 환경에서는 Hibernate `ddl-auto`가 `update`이고 Flyway는 비활성화됩니다. 로컬 개발과 자동 test의 빠른 실행을 위한 구성이며 운영 데이터 저장소가 아닙니다.

### PostgreSQL

`postgres` profile은 PostgreSQL driver를 사용하고 Hibernate schema validation과 Flyway를 활성화합니다.

```bash
cd server
gradle bootRun --args='--spring.profiles.active=postgres'
```

PostgreSQL schema는 `src/main/resources/db/migration/postgresql`의 versioned migration으로 관리합니다. 적용된 migration을 수정하지 말고 다음 번호의 파일을 추가해야 합니다.

## 테스트

```bash
cd server
gradle test
```

integration/security test는 `src/test/kotlin/com/lumine/server`에 있습니다. 인증, 사용자 격리, provider token 검증, content import, 일기 version 충돌과 계정 삭제 같은 경계를 Spring Boot test로 검증합니다.

## 폴더와 책임

```text
server/
├── src/main/kotlin/com/lumine/server/
│   ├── auth/             # provider 검증, JWT, login/logout와 인증 주체
│   ├── journal/          # 사용자별 일기, 낙관적 version과 위로 문구
│   ├── screening/        # 질문지, 제출·이력과 결과 narrative
│   ├── support/          # 안전 도움 resource와 API mapping
│   ├── user/             # profile, 내보내기와 계정 삭제
│   ├── contentimport/    # 게스트 기록의 멱등 이전과 충돌 처리
│   ├── global/           # 공통 API envelope와 security 설정
│   ├── common/           # 작은 공통 utility
│   └── openai/           # 외부 OpenAI client
├── src/main/resources/
│   ├── application.yml
│   ├── application-postgres.yml
│   └── db/migration/postgresql/
└── src/test/kotlin/com/lumine/server/
```

도메인 내부는 `Controller → Service → Repository/Entity` 흐름을 따릅니다. Controller는 HTTP와 DTO를 처리하고, Service는 business rule과 transaction을, Repository는 persistence query를 소유합니다. JPA entity를 API 응답으로 직접 노출하지 않습니다.

## API와 인증 경계

다음 endpoint만 인증 없이 접근할 수 있습니다.

| Method | Path | 목적 |
| --- | --- | --- |
| `GET` | `/actuator/health` | health/readiness 확인 |
| `POST` | `/api/auth/login/kakao` | Kakao provider token으로 로그인 |
| `POST` | `/api/auth/login/google` | Google provider token으로 로그인 |
| `GET` | `/api/screening/questionnaire` | 마음 상태 확인 질문지 조회 |
| `GET` | `/api/support/resources` | 안전 도움 resource 조회 |

그 밖의 `/api/**` 요청에는 `Authorization: Bearer <JWT>`가 필요합니다. 여기에는 logout, profile과 본인 데이터 조회·내보내기·삭제, 게스트 content import, 일기 조회·저장·삭제, 마음 상태 제출·최근 결과·이력이 포함됩니다.

주요 로컬 확인:

```text
GET http://localhost:8080/actuator/health
GET http://localhost:8080/api/screening/questionnaire
GET http://localhost:8080/api/support/resources
```

## 환경변수

실제 secret은 source나 README에 기록하지 말고 로컬의 gitignored 환경 파일 또는 운영 secret store로 주입합니다.

### Runtime과 database

| 이름 | 용도 |
| --- | --- |
| `SERVER_PORT` | HTTP server port |
| `SPRING_PROFILES_ACTIVE` | `postgres` 등 활성 Spring profile |
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | PostgreSQL 사용자 |
| `DB_PASSWORD` | PostgreSQL 비밀번호 |
| `DB_MAX_POOL_SIZE` | Hikari maximum pool size |
| `DB_MIN_IDLE` | Hikari minimum idle connection 수 |

### JWT와 인증

| 이름 | 용도 |
| --- | --- |
| `AUTH_MOCK_LOGIN_ENABLED` | provider 검증을 생략하는 로컬 mock login 허용 여부 |
| `AUTH_JWT_SECRET` | JWT 서명 secret |
| `AUTH_JWT_ISSUER` | JWT issuer |
| `AUTH_JWT_ACCESS_TOKEN_TTL_SECONDS` | access token 유효시간(초) |

`AUTH_MOCK_LOGIN_ENABLED`는 로컬 개발에만 사용해야 하며 운영에서는 반드시 비활성화합니다. 운영에서는 개발용 기본 JWT secret을 사용하지 말고 충분히 강한 secret을 외부 secret store에서 주입해야 합니다.

### Google과 Kakao

| 이름 | 용도 |
| --- | --- |
| `GOOGLE_CLIENT_IDS` | 허용할 Google ID token `aud` 목록 |
| `GOOGLE_TOKEN_INFO_URL` | Google token 검증 endpoint override |
| `KAKAO_APP_IDS` | Kakao token-info가 반환하는 허용 가능한 숫자형 `app_id` 목록 |
| `KAKAO_TOKEN_INFO_URL` | Kakao access token 검증 endpoint override |
| `KAKAO_USER_INFO_URL` | Kakao 사용자 정보 endpoint override |

Google login은 앱이 보낸 ID token의 실제 `aud`가 `GOOGLE_CLIENT_IDS`에 포함되는지 확인합니다. 현재 native Google login 흐름에서는 이 값이 web client ID이므로, 앱의 Google Sign-In 설정이 발급하는 ID token의 `aud`를 등록해야 합니다.

Kakao login은 access token을 token-info endpoint로 검증하고, 응답의 숫자형 `app_id`가 `KAKAO_APP_IDS`에 포함되는지 확인합니다. 이 `app_id`는 모바일 SDK 초기화에 사용하는 native app key와 서로 다른 값이므로 같은 값으로 맞추지 않습니다.

### OpenAI

| 이름 | 용도 |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI API 인증 key |
| `OPENAI_MODEL` | 사용할 model ID |
| `OPENAI_BASE_URL` | OpenAI API base URL override |

OpenAI 설정은 선택 사항입니다. API key가 없거나 외부 생성이 실패해도 일기 위로 문구와 마음 상태 결과는 기존 deterministic fallback을 사용합니다.

## OpenAPI와 Swagger

현재 `build.gradle.kts`에는 Springdoc/OpenAPI dependency가 없으며 `/swagger-ui`와 `/v3/api-docs`를 제공하지 않습니다. API 동작은 각 domain의 `*Controller.kt`, request/response model, integration test와 client의 `@lumine/api-contracts`를 기준으로 확인합니다. OpenAPI 문서를 도입하려면 dependency와 보안 공개 경로를 함께 설계해야 합니다.

## 운영 배포

운영 server는 Docker image로 빌드해 Amazon ECR에 저장하고 Amazon EKS Auto Mode의 독립 Deployment로 배포합니다. PostgreSQL은 Amazon RDS를 사용하고 application secret은 AWS Secrets Manager에서 Kubernetes Secret으로 전달합니다. 인프라, GitHub Actions OIDC, ALB, DNS와 인증서 설정은 [AWS EKS 배포 가이드](../docs/aws-deployment.md)를 따릅니다.
