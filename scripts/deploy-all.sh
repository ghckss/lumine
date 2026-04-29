#!/bin/zsh
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
"$ROOT_DIR/scripts/deploy-server.sh"
"$ROOT_DIR/scripts/deploy-web.sh"
