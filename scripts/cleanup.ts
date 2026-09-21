// Daily inactivity cleanup job (VPS cron) — entrypoint for `npm run cleanup`.
//
// Deletes visitors with zero activity for INACTIVE_DAYS consecutive days and
// writes a CleanupLog summary. Runs independently of the hourly sync cron.

import "dotenv/config";

import { runCleanup } from "../lib/cleanup";

if (process.argv[1]?.endsWith("cleanup.ts")) {
  runCleanup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[cleanup] fatal:", err);
      process.exit(1);
    });
}