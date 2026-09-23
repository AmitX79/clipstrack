/// <reference types="@cloudflare/workers-types" />

// Custom Cloudflare Worker entrypoint (wrangler.jsonc "main"). Wraps the
// OpenNext-generated fetch handler and adds a `scheduled` handler so Cloudflare
// Cron Triggers reach the protected /api/cron/* endpoints. The generated
// .open-next/worker.js is produced by `opennextjs-cloudflare build`.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";

interface CronEnv {
  CRON_SECRET?: string;
}

async function dispatchCron(
  env: CronEnv,
  ctx: ExecutionContext,
  path: string,
): Promise<void> {
  if (!env.CRON_SECRET) {
    console.error(`[scheduled] ${path} skipped: CRON_SECRET not set`);
    return;
  }
  const request = new Request(`https://internal${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.CRON_SECRET}` },
  });
  const response = await handler.fetch(request, env, ctx);
  if (response.status !== 200) {
    console.error(
      `[scheduled] ${path} -> ${response.status}: ${await response.text()}`,
    );
  } else {
    console.log(`[scheduled] ${path} -> ${response.status}`);
  }
}

export default {
  fetch: handler.fetch,

  async scheduled(
    controller: ScheduledController,
    env: CronEnv,
    ctx: ExecutionContext,
  ): Promise<void> {
    const cron = controller.cron;
    if (cron === "0 * * * *") {
      // Hourly: YouTube only (official Data API quota).
      await dispatchCron(env, ctx, "/api/cron/sync?platform=YOUTUBE");
    } else if (cron === "0 */3 * * *") {
      // Every 3 hours: Instagram + TikTok only (ScrapeCreators budget).
      await dispatchCron(env, ctx, "/api/cron/sync?platform=IGTIKTOK");
    } else if (cron === "0 2 * * *") {
      await dispatchCron(env, ctx, "/api/cron/cleanup");
    } else {
      // Also covers manual `wrangler dev --test-scheduled` runs.
      await dispatchCron(env, ctx, "/api/cron/sync");
      await dispatchCron(env, ctx, "/api/cron/cleanup");
    }
  },
} satisfies ExportedHandler<CronEnv>;