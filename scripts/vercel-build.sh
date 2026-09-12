#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# Refresh the bundled Arabic-script English ↔ Balochi parallel corpus.
# If Hugging Face is temporarily unavailable, keep the committed fallback pairs.
python3 scripts/update-balochi-parallel.py || echo "Parallel corpus refresh failed; using bundled fallback."

npm run build

TARGET="services/balochi-model-server"
rm -rf "$TARGET/.next" "$TARGET/public"
cp -R .next "$TARGET/.next"
cp -R public "$TARGET/public"
