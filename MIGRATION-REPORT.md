# ClipsTrack — Neon SQL Migration Report ("what broke")

Status: shipped. All checks pass on the Cloudflare Workers deployment; Vercel has been decommissioned.

## 1. Why this migration happened

ClipsTrack used Prisma (7.10.0) for all database access. After OpenNext bundled the worker
for Cloudflare (`workerd`), every DB call failed with:

    Error: WebAssembly.Module(): Wasm code generation disallowed by embedder

Prisma ships its query engine as WASM in `workerd` builds; the embedder refuses to compile it,
and no `.wasm` asset ends up inside the final worker. Prisma is not usable on Cloudflare
Workers, so the DB layer was rewritten to call Postgres over HTTP directly using
`@neondatabase/serverless` (v1.1.0). The exposed functions — `query`, `queryOne`, `exec`,
`tx` (batch transaction), tagged `sql`, `id()` — keep the same call shapes the rest of the
app already used, so `lib/` and `app/` changes were mechanical.

## 2. What broke and how it was fixed (smallest first)

| # | Symptom | Root cause | Fix |
|---|---------|-----------|-----|
| 1 | `ensureUserCode` silently created no row; admin could not look visitors up ("grant credits" panel stuck) | `user_codes.updatedAt` is **NOT NULL with no DB default**; the rewrite's INSERT omitted it, every insert threw, the fallback path returned the derived code anyway | Add `"updatedAt" = now()` to both `user_codes` INSERT/ON CONFLICT blocks in `lib/usercode.ts` |
| 2 | Same class of failure in the credit engine | `credit_usage.updatedAt` is NOT NULL, no default; `consumeCredits` INSERT omitted it | Add `"updatedAt" = now()` to the `credit_usage` ensure-insert in `lib/credits.ts` |
| 3 | Prerendered pages kept the old origin after only passing `SITE_URL` on the CLI | `next build`'s prerender workers did not receive the shell-inherited env var, so `process.env.SITE_URL ?? fallback` fell back to `clipstrack.vercel.app` | Put `SITE_URL` in `.env` (Next loads it before spawning prerender workers). The compiled server chunk literally contained `SITE_URL??"https://clipstrack.vercel.app"` |
| 4 | Wrong-looking served origin right after a deploy | Cloudflare edge cached the previous `/` response | Not a bug — cache-busted fetches (`?cb=…`) return the new HTML |

## 3. Empirical driver facts (verified against the prod DB, not the docs)

- `DATABASE_URL` in `.env` is wrapped in double quotes — strip them / unquote before passing to `neon()`; scheme is `postgresql://` pointing at the Neon pooler host (`*-pooler.c-5.us-east-2.aws.neon.tech`), user `neondb_owner`.
- `@neondatabase/serverless` 1.1.0 supports tagged-template `neon()`, `.query(text, params)`, `.unsafe()`, and `.transaction()` — but transactions are **non-interactive**: build all statements up-front (do reads outside), then send them as one static batch. `lib/db.ts` exposes `tx(statements)` for exactly this.
- Type decoding: `timestamptz` → `Date`; `int8`/bigint (`count(*)`, `SUM(int)`) → **string**; int4 → number; bool → boolean; `numeric` → string. `lib/db.ts` coerces `int8` (OID 20) to `Number` using `fullResults` field metadata (all values < 2^53).
- Table names are snake_case (`credit_usage`, `grant_history`, `cleanup_logs`, …); **every column is camelCase and must be double-quoted** in SQL (`"userId"`, `"comboHash"`, `"lastActive"`, …).

## 4. Schema gotchas encoded in the rewrite

- `updatedAt` is NOT NULL with **no default** on: `users`, `channels`, `videos`, `user_codes`, `credit_usage`, `settings`, `scrape_keys`, `youtube_keys`, `youtube_quota_usage` — every INSERT must set it (use `now()`).
- `createdAt` always defaults to `CURRENT_TIMESTAMP` — do not set it (except when an explicit value is wanted).
- No `updatedAt` column at all on: `channel_snapshots`, `video_snapshots`, `grant_history`, `cleanup_logs`.
- FK cascades: `users_channels_videos_snapshots` all cascade; `user_codes` and `credit_usage` have no FKs (lifecycle handled by cleanup logic). `grant_history` is intentionally not an FK so it survives an owner purge.
- The `users.comboHash` column exists but is **nullable** (it never appeared in an earlier NOT-NULL-only probe and was initially suspected missing).

## 5. Build & deploy pipeline (mandatory sequence after every change)

    npm run build            # next build --webpack
    npx opennextjs-cloudflare build
    mkdir -p .open-next/assets/cdn-cgi
    cp -a .open-next/cache/. .open-next/assets/cdn-cgi/_next_cache/
    npx wrangler deploy

The cache copy is what makes prerendered/`cache` pages resolvable under `cdn-cgi/_next_cache/`
(the `StaticAssetsIncrementalCache` override's `CACHE_DIR`, and its parent dir is not created
by the build — the `mkdir -p` is required).

Known quirks:
- `.open-next/cache` / `.next` render output is incremental: after `rm -rf .next .open-next` it is rebuilt fully.
- Cron triggers (`0 * * * *` sync, `0 2 * * *` cleanup) are registered in `wrangler.jsonc` and listed on `wrangler deploy`.
- Secrets live as `wrangler` secrets: DATABASE_URL, ADMIN_SECRET, YOUTUBE_API_KEY, SCRAPECREATORS_API_KEY, CRON_SECRET. `SITE_URL` is a `vars` entry AND in `.env` (for build-time prerender; `.env` is the channel that actually works).

## 6. Verification (all green after the final deploy)

- Type check `npx tsc --noEmit`, lint `npm run lint` (0 errors), `npm run build`, opennext build, deploy.
- Route matrix on `https://clipstrack.clipstrack.workers.dev`: `/`, locale pages, marketing pages, `/accounts`, `/admin` (DB panel: 21 channels tracked, 45 users, YouTube quota 180/10000 units, grant history rendered) → 200; `/en` → 308; bad paths → 404; `/admin/login` → 307.
- `POST /api/cron/cleanup` with `Authorization: Bearer $CRON_SECRET` → `{"ok":true,"deletedUsers":0,"deletedChannels":0}`.
- `SITE_URL`-baked HTML: JSON-LD and all origins resolve to the workers.dev URL (checked with cache-busting params).
- Full Playwright suite `E2E_BASE=https://clipstrack.clipstrack.workers.dev node scripts/e2e_features.mjs` → **ALL PASS** (consent, badge/credits, admin grant flow incl. bonus + daily override + grant history, decline flow).
- Admin dashboard proved end-to-end DB reads + the `bonus`/`override` `tx` writes (grant history shows the grants).

## 8. Hardening added after first verification

Two low-risk findings from the wrap-up review were fixed (both backward-compatible, no
behavior change for legitimate users):

- `lookupUserByCode` (admin "Grant credits" search) now checks `isAdmin()` like every other
  admin action. It previously returned a valid visitor's usage/budget preview to anyone who
  could invoke the server action. `NOT_SIGNED_IN` was un-annotated (`as const`) so it stays
  assignable to both `AdminResult` and `GrantLookupResult`.
- `/api/contact` (the only intentionally public API) now has a per-IP daily rate limit
  (20/day, `lib/contact.ts`). Backing table `contact_rate_limit (ip, date, count)`, PK
  `(ip, date)`, created against Neon via DDL. **Fail-open**: if the counter query errors the
  request is still allowed, so storage problems can never take down the contact form. Returns
  `429 {error:"rate_limited"}` past the cap; the client shows its existing generic error.

Operational note discovered while wiring the table: **`.unsafe()` is a silent no-op in
`@neondatabase/serverless` 1.1.0 against the Neon pooler URL** — `db.unsafe("SELEC 1")`
resolves without error and DDL via `.unsafe()` never persists. Use `db.query(sql, params)`
for DDL/DML instead. No app code uses `.unsafe()` (verified by grep).

Re-verified after deploying: contact companion integration test (`checkContactLimit` x22 →
requests 21+ denied, exact threshold), route matrix served secrets scan (all 0 hits), and the
full Playwright suite → ALL PASS.

- Cloudflare Worker `clipstrack` on `clipstrack.clipstrack.workers.dev` — production (verified, e2e green).
- Vercel: project `clipstrack` (79xamit) **deleted**; `https://clipstrack.vercel.app` returns 404. No projects remain under the account.
- VPS: **still running — needs manual teardown** (Playwright bits, Redis, systemd units). Not reached from this session because there are no SSH keys / host / inventory records in the repo or environment. Requires host + credentials from the operator.
- Prisma: generator in `prisma/schema.prisma` reverted to the default (no `runtime = "workerd"`); the webpack WASM rule was removed from `next.config.mjs`; no runtime imports of `app/generated/prisma` remain. `prisma generate` still runs in postinstall as the schema's DDL is the source of truth.