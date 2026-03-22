#!/bin/bash
set -euo pipefail

# ── Install dependencies ──────────────────────────────────────────
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  npm install --prefer-offline --no-audit --no-fund 2>&1
fi

# ── Security action item reminder ────────────────────────────────
ACTIONS_FILE="$CLAUDE_PROJECT_DIR/SECURITY_ACTIONS.md"

if [ -f "$ACTIONS_FILE" ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║           ⚠  PENDING SECURITY ACTIONS  ⚠               ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  echo "  🔴  Rotate CRON_SECRET in Vercel (old value is burned)"
  echo "  🔴  Confirm NUXT_JWT_SECRET is set in Vercel env vars"
  echo "  🟡  Add rate limiting to /api/auth/login (brute-force)"
  echo "  🟡  Add rate limiting to /api/chat (cost abuse)"
  echo ""
  echo "  Full details: SECURITY_ACTIONS.md"
  echo ""
fi
