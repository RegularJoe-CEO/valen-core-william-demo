#!/usr/bin/env bash
# One command: build, proof agent desk hooks, start Core for William demo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/runtime"
npm install
npm run build
npm run proof:agent-desk
echo ""
echo "============================================================"
echo " LIVE AGENT DESK — ready for William"
echo "============================================================"
echo " Open: http://localhost:9252/?demo=william"
echo " DOM-only demo (no 3D noise). Center panel steps 1→5 in ~6s."
echo " Or click: Launch Live Agent Desk"
echo " Audio ON recommended."
echo "============================================================"
PORT="${PORT:-9252}"
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  OLD_PID="$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -1)"
  echo ""
  echo " Port $PORT in use (pid ${OLD_PID:-unknown}) — stopping previous Core server..."
  kill "$OLD_PID" 2>/dev/null || true
  sleep 0.5
fi
export VALEN_WILLIAM_DEMO=1
exec npm run serve