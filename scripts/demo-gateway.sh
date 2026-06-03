#!/usr/bin/env bash
# Live Agent Desk gateway proof — M2 preview (DOM, no WebGL boot).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/runtime"
npm install
npm run proof:agent-desk
echo ""
echo "============================================================"
echo " Live Agent Desk — gateway proof (Milestone 2 preview)"
echo "============================================================"
echo " Open: http://localhost:${PORT:-9252}/gateway-proof.html"
echo " Watch the RIGHT panel: cards move with no clicks (~8s)."
echo "============================================================"
PORT="${PORT:-9252}"
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  OLD_PID="$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -1)"
  echo " Port $PORT in use (pid ${OLD_PID:-?}) — stopping previous server..."
  kill "$OLD_PID" 2>/dev/null || true
  sleep 0.5
fi
if command -v open >/dev/null 2>&1; then
  (sleep 1.2 && open "http://localhost:${PORT}/gateway-proof.html") &
fi
export VALEN_GATEWAY_DEMO=1
exec node scripts/dev-server.mjs