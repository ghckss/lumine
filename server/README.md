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
cd /Users/hwanghochan/workspace/melancholy/server
GRADLE_USER_HOME=/tmp/gradle-home JAVA_TOOL_OPTIONS='-Djava.io.tmpdir=/tmp' /tmp/gradle-8.10.2/bin/gradle --project-cache-dir /tmp/gradle-project-cache bootRun
```

## PostgreSQL로 실행
기본 접속 정보:
- host: `localhost`
- port: `5432`
- db: `melancholy`
- user: `melancholy`
- password: `melancholy`

```bash
cd /Users/hwanghochan/workspace/melancholy/server
GRADLE_USER_HOME=/tmp/gradle-home JAVA_TOOL_OPTIONS='-Djava.io.tmpdir=/tmp' /tmp/gradle-8.10.2/bin/gradle --project-cache-dir /tmp/gradle-project-cache bootRun --args='--spring.profiles.active=postgres'
```

환경변수로 덮어쓸 수도 있습니다.
```bash
export DB_URL=jdbc:postgresql://localhost:5432/melancholy
export DB_USERNAME=melancholy
export DB_PASSWORD=melancholy
```

## 테스트 실행
```bash
cd /Users/hwanghochan/workspace/melancholy/server
GRADLE_USER_HOME=/tmp/gradle-home JAVA_TOOL_OPTIONS='-Djava.io.tmpdir=/tmp' /tmp/gradle-8.10.2/bin/gradle --project-cache-dir /tmp/gradle-project-cache test
```

## 기본 포트
- `8080`

## 주요 확인 URL
- `GET http://localhost:8080/api/screening/questionnaire`
- `GET http://localhost:8080/api/journal/entries/history?limit=10`
- `GET http://localhost:8080/api/support/resources`
