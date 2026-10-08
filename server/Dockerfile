FROM gradle:8.10.2-jdk17 AS builder
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=postgres
RUN addgroup -S lumine && adduser -S lumine -G lumine
COPY --from=builder /app/build/libs/*.jar /app/app.jar
RUN chown -R lumine:lumine /app
USER lumine
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
