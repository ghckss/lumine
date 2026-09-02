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

wait_for_http() {
  local name="$1"
  local url="$2"
  local attempts="${3:-60}"

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "[lumine] ${name} is ready"
      return 0
    fi
    sleep 1
  done

  echo "[lumine] ${name} failed to become ready: ${url}" >&2
  return 1
}

run_bg server /bin/zsh -lc "cd '$ROOT_DIR' && ./scripts/run-server-dev.sh"
run_bg metro /bin/zsh -lc "cd '$ROOT_DIR/app' && pnpm start"

wait_for_http server "http://127.0.0.1:8080/api/screening/questionnaire"
sleep 3

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
