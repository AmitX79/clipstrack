#!/usr/bin/env bash
# ClipsTrack "make it live" boot script — runs at VPS startup (@reboot cron).
# Ensures the three live pieces are up: the local Prisma Postgres server, the
# schema, and the production Next.js server. Idempotent — safe to re-run.
set -u

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="/tmp/opencode/live-boot.log"

log() { echo "[boot] $(date '+%H:%M:%S') $*" >> "$LOG"; }

cd "$DIR"

# 1. Local Prisma Postgres server (prisma dev)
if ! /usr/bin/npx prisma@7.10.0 dev ls 2>/dev/null | grep -q "running"; then
  log "starting prisma dev"
  /usr/bin/npx prisma@7.10.0 dev -d >> "$LOG" 2>&1
else
  log "prisma dev already running"
fi

# 2. Apply schema (idempotent; creates tables on the very first boot)
log "pushing schema"
/usr/bin/npx prisma@7.10.0 db push >> "$LOG" 2>&1
log "db push done"

# 3. Production Next.js server on :3000 (uses .next build artifact)
if ! ss -tln 2>/dev/null | grep -q ":3000\b"; then
  log "starting next start on :3000"
  nohup /usr/bin/npm run start -- -H 0.0.0.0 -p 3000 >> "$LOG" 2>&1 &
else
  log "next start already running"
fi

log "boot complete"