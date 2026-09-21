#!/usr/bin/env bash
# Daily inactive-account cleanup cron wrapper — deletes visitors silent for
# INACTIVE_DAYS consecutive days and logs a CleanupLog summary.
set -u
cd "$(dirname "${BASH_SOURCE[0]}")/.."
/usr/bin/npm run cleanup