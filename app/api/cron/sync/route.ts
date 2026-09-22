import { runSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

// Hourly full sweep (Cloudflare Cron Trigger -> custom worker's scheduled
// handler dispatches here with a Bearer CRON_SECRET). Also manually invocable:
// curl -X POST https://<site>/api/cron/sync -H "Authorization: Bearer $CRON_SECRET"
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function run(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    await runSync();
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