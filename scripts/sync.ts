// Hourly sync job (VPS cron) — entrypoint for `npm run sync`.
//
// The DB lives on Neon, so if this VPS goes down only the *new* updates
// pause; the Cloudflare Pages site and existing data stay live.

import "dotenv/config";

import { runSync } from "../lib/sync";

if (process.argv[1]?.endsWith("sync.ts")) {
  runSync()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[sync] fatal:", err);
      process.exit(1);
    });
}