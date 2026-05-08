#!/usr/bin/env bash
set -euo pipefail

npm run build

PORT="${PORT:-4173}"
node scripts/serve-static.mjs docs "$PORT" &
SERVER_PID="$!"
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

READY=0
for _ in {1..50}; do
  if curl -fsS "http://127.0.0.1:${PORT}/room-vj/" >/dev/null; then
    READY=1
    break
  fi
  sleep 0.1
done

if [[ "$READY" != "1" ]]; then
  echo "Static smoke server did not become ready." >&2
  exit 1
fi

SMOKE_URL="http://127.0.0.1:${PORT}/room-vj/" node scripts/smoke.mjs
