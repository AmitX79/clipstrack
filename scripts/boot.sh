#!/usr/bin/env bash
# ClipsTrack boot script — runs at VPS startup (@reboot cron).
# With Neon, the DB is remote, so we only need to (re)create tables and
# start the production Next.js server. Idempotent — safe to re-run.
set -u

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="/tmp/opencode/live-boot.log"

log() { echo "[boot] $(date '+%H:%M:%S') $*" >> "$LOG"; }

cd "$DIR"

# 1. Apply schema to the remote Neon DB (idempotent; creates tables on first boot)
log "pushing schema to Neon"
/usr/bin/npx prisma@7.10.0 db push >> "$LOG" 2>&1
log "db push done"

# 2. Production Next.js server on :3000 (uses .next build artifact)
if ! ss -tln 2>/dev/null | grep -q ":3000\b"; then
  log "starting next start on :3000"
  nohup /usr/bin/npm run start -- -H 0.0.0.0 -p 3000 >> "$LOG" 2>&1 &
else
  log "next start already running"
fi

log "boot complete"