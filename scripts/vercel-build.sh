#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

npm run build

TARGET="services/balochi-model-server"
rm -rf "$TARGET/.next" "$TARGET/public"
cp -R .next "$TARGET/.next"
cp -R public "$TARGET/public"
