#!/usr/bin/env bash
# Hourly sync cron wrapper — runs the data collector against every tracked
# account. Failures inside the collector are per-channel and non-fatal.
set -u
cd "$(dirname "${BASH_SOURCE[0]}")/.."
/usr/bin/npm run sync