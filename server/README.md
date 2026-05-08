# Server

Spring Boot + Kotlin 서버입니다.

## 요구 사항
- Java 17
- Gradle 8.x

## 현재 상태
- Gradle wrapper(`./gradlew`)는 없습니다.
- 그래서 로컬 Gradle 또는 별도 설치된 Gradle로 실행해야 합니다.
- 기본 프로필은 H2 인메모리 DB를 사용합니다.
- `postgres` 프로필을 켜면 PostgreSQL을 사용합니다.

## 기본 실행(H2)
```bash
cd /Users/hwanghochan/workspace/lumine/server
GRADLE_USER_HOME=/tmp/gradle-home JAVA_TOOL_OPTIONS='-Djava.io.tmpdir=/tmp' /tmp/gradle-8.10.2/bin/gradle --project-cache-dir /tmp/gradle-project-cache bootRun
```

루트 스크립트(`npm run dev:server`, `npm run dev:all`)는 아래 파일들을 자동으로 읽습니다.

- `/Users/hwanghochan/workspace/lumine/.env.local`
- `/Users/hwanghochan/workspace/lumine/server/.env`
- `/Users/hwanghochan/workspace/lumine/server/.env.local`

OpenAI를 로컬에서 켜려면 예를 들어 `server/.env.local`에 다음처럼 둡니다.

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.2
```

환경변수 변경 후에는 서버를 반드시 재기동해야 합니다.

## PostgreSQL로 실행
기본 접속 정보:
- host: `localhost`
- port: `5432`
- db: `lumine`
- user: `lumine`
- password: `lumine`

```bash
cd /Users/hwanghochan/workspace/lumine/server
GRADLE_USER_HOME=/tmp/gradle-home JAVA_TOOL_OPTIONS='-Djava.io.tmpdir=/tmp' /tmp/gradle-8.10.2/bin/gradle --project-cache-dir /tmp/gradle-project-cache bootRun --args='--spring.profiles.active=postgres'
```

환경변수로 덮어쓸 수도 있습니다.
```bash
export DB_URL=jdbc:postgresql://localhost:5432/lumine
export DB_USERNAME=lumine
export DB_PASSWORD=lumine
```

## 테스트 실행
```bash
cd /Users/hwanghochan/workspace/lumine/server
GRADLE_USER_HOME=/tmp/gradle-home JAVA_TOOL_OPTIONS='-Djava.io.tmpdir=/tmp' /tmp/gradle-8.10.2/bin/gradle --project-cache-dir /tmp/gradle-project-cache test
```

## 기본 포트
- `8080`

## 소셜 로그인 검증 설정
서버는 앱에서 받은 provider token을 서버에서 다시 검증합니다.

```bash
export GOOGLE_CLIENT_IDS=your-google-web-client-id.apps.googleusercontent.com
export KAKAO_APP_IDS=123456
```

로컬 mock 로그인을 허용하려면 다음 값을 켭니다.

```bash
export AUTH_MOCK_LOGIN_ENABLED=true
```

Google은 앱이 전달한 `idToken`을 `https://oauth2.googleapis.com/tokeninfo`로 검증하고, `aud`가 `GOOGLE_CLIENT_IDS` 중 하나인지 확인합니다. Kakao는 access token을 `https://kapi.kakao.com/v1/user/access_token_info`로 검증하고, 응답의 `app_id`가 `KAKAO_APP_IDS` 중 하나인지 확인합니다.

## 주요 확인 URL
- `GET http://localhost:8080/api/screening/questionnaire`
- `GET http://localhost:8080/api/journal/entries/history?limit=10`
- `GET http://localhost:8080/api/support/resources`
