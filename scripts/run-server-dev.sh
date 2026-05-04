#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
GRADLE_VERSION="8.10.2"
GRADLE_DIR="/tmp/gradle-${GRADLE_VERSION}"
GRADLE_BIN="${GRADLE_DIR}/bin/gradle"
GRADLE_ZIP="/tmp/gradle-${GRADLE_VERSION}-bin.zip"
GRADLE_USER_HOME_DIR="/tmp/gradle-home-lumine-server"
GRADLE_PROJECT_CACHE_DIR="/tmp/gradle-project-cache-lumine-server"

ensure_gradle() {
  if [[ -x "$GRADLE_BIN" ]]; then
    return
  fi

  mkdir -p /tmp

  if [[ ! -f "$GRADLE_ZIP" ]]; then
    echo "[lumine] downloading gradle ${GRADLE_VERSION}"
    curl -L -o "$GRADLE_ZIP" "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip"
  fi

  echo "[lumine] unpacking gradle ${GRADLE_VERSION}"
  unzip -q -o "$GRADLE_ZIP" -d /tmp
  chmod +x "$GRADLE_BIN"
}

mkdir -p "$GRADLE_USER_HOME_DIR" "$GRADLE_PROJECT_CACHE_DIR"
ensure_gradle

cd "$ROOT_DIR/server"
exec env \
  SERVER_PORT=8080 \
  GRADLE_USER_HOME="$GRADLE_USER_HOME_DIR" \
  JAVA_TOOL_OPTIONS="-Djava.io.tmpdir=/tmp" \
  "$GRADLE_BIN" \
  --project-cache-dir "$GRADLE_PROJECT_CACHE_DIR" \
  bootRun \
  --args="--server.port=8080"
