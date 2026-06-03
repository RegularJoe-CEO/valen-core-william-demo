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
echo " (Use localhost — not 0.0.0.0. You should see 'Starting Core…' immediately.)"
echo " Or click: Launch Live Agent Desk"
echo " Audio ON recommended."
echo "============================================================"
exec npm run serve