#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PIDS=()

cleanup() {
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done
}
trap cleanup EXIT INT TERM

run_bg() {
  local name="$1"
  shift
  echo "[lumine] starting ${name}"
  (
    cd "$ROOT_DIR"
    "$@"
  ) &
  PIDS+=("$!")
}

run_bg server /bin/zsh -lc "cd '$ROOT_DIR/server' && GRADLE_USER_HOME=/tmp/gradle-home JAVA_TOOL_OPTIONS='-Djava.io.tmpdir=/tmp' /tmp/gradle-8.10.2/bin/gradle --project-cache-dir /tmp/gradle-project-cache bootRun"
run_bg web /bin/zsh -lc "cd '$ROOT_DIR/web' && npm run dev"
run_bg metro /bin/zsh -lc "cd '$ROOT_DIR/app' && pnpm start"

sleep 8

echo "[lumine] launching ios"
(
  cd "$ROOT_DIR/app"
  pnpm ios:no-packager
)

echo "[lumine] launching android"
(
  cd "$ROOT_DIR/app"
  pnpm android:no-packager
)

wait
