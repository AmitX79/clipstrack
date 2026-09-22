import { runCleanup } from "@/lib/cleanup";

export const dynamic = "force-dynamic";

// Daily inactivity purge (Cloudflare Cron Trigger -> scheduled handler with a
// Bearer CRON_SECRET). Also manually invocable:
// curl -X POST https://<site>/api/cron/cleanup -H "Authorization: Bearer $CRON_SECRET"
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
    const result = await runCleanup();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/cleanup]", err);
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