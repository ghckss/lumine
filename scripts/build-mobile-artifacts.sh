#!/bin/zsh
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[lumine] building android AAB"
(
  cd "$ROOT_DIR/client/apps/app/android"
  ./gradlew bundleRelease
)

echo "[lumine] building ios archive"
(
  cd "$ROOT_DIR/client/apps/app/ios"
  xcodebuild -workspace LumineNativeShell.xcworkspace \
    -scheme LumineNativeShell \
    -configuration Release \
    -archivePath build/LumineNativeShell.xcarchive \
    archive
)
