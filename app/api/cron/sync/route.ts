import { runSync, type SyncPlatformGroup } from "@/lib/sync";

export const dynamic = "force-dynamic";

// Scheduled sync (Cloudflare Cron Trigger -> custom worker's scheduled handler
// dispatches here with a Bearer CRON_SECRET). The 3-hourly worker run only
// touches Instagram/TikTok and the hourly run only YouTube, via ?platform=.
// Also manually invocable without the param (full sweep):
// curl -X POST https://<site>/api/cron/sync?platform=YOUTUBE \
//   -H "Authorization: Bearer $CRON_SECRET"
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const platform = new URL(request.url).searchParams.get("platform");
  let groups: SyncPlatformGroup[] | undefined;
  if (platform) {
    if (platform === "YOUTUBE") groups = ["YOUTUBE"];
    else if (platform === "IGTIKTOK") groups = ["IGTIKTOK"];
    else {
      return Response.json(
        { ok: false, error: `unknown platform group: ${platform}` },
        { status: 400 },
      );
    }
  }
  try {
    await runSync(groups);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[cron/sync]", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export function GET(request: Request): Promise<Response> {
  return run(request);
}

export function POST(request: Request): Promise<Response> {
  return run(request);
}