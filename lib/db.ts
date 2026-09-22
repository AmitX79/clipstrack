// ClipsTrack database layer.
//
// Single SQL interface over the Neon HTTP driver (`@neondatabase/serverless`),
// which runs on Cloudflare Workers (fetch-based — no TCP sockets or WASM).
// Prisma 7's WASM query compiler cannot run inside workerd, so this module
// speaks raw SQL. Every identifier matches the Postgres schema exactly:
// Prisma-created camelCase columns are quoted ("userId"), tables are snake_case.
//
// Type-mapping notes (empirically verified against the live DB):
//   - timestamptz comes back as a `Date` (same as pg/Prisma)
//   - int8 / bigint columns come back as strings from the driver; every bigint
//     here is a view counter or a count(*) well below 2^53, so result rows are
//     mapped to `Number` so consumers can compare/format freely.
//   - new row ids are `crypto.randomUUID()` (the cuid-style ids Prisma used are
//     just strings, and a uuid is equally valid).
//
// Usage everywhere else: `import { sql } from "@/lib/db"` (tagged template),
// or `query`/`queryOne`/`exec` for parameterized statements, and `transaction`
// for a static batch of writes.

import {
  neon,
  SqlTemplate,
  type NeonQueryFunction,
} from "@neondatabase/serverless";

type Row = Record<string, unknown>;

// int8 (Postgres OID 20) is returned as a string; this app's bigint columns
// never exceed 2^53, so coerce lazily whenever a result contains one.
const BIGINT_OID = 20;

let database: NeonQueryFunction<false, false> | null = null;

function connectionString(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }
  let url = raw.trim();
  if (url.startsWith('"') && url.endsWith('"')) {
    url = url.slice(1, -1);
  }
  if (url.startsWith("prisma+postgres://")) {
    // Local Prisma Postgres (`prisma dev`): the api_key embeds the real
    // postgres:// TCP URL. Only runs in Node — never on Workers.
    const parsed = new URL(url);
    const key = parsed.searchParams.get("api_key");
    if (!key) {
      throw new Error("prisma+postgres:// URL is missing api_key");
    }
    const payload = JSON.parse(
      Buffer.from(key, "base64url").toString("utf8"),
    ) as { databaseUrl?: string };
    if (!payload.databaseUrl) {
      throw new Error("api_key payload has no databaseUrl");
    }
    url = payload.databaseUrl;
  }
  return url;
}

function getDb(): NeonQueryFunction<false, false> {
  if (!database) {
    database = neon(connectionString());
  }
  return database;
}

async function run(
  text: string,
  params: unknown[],
): Promise<Row[]> {
  const { rows: rawRows, fields } = await getDb().query(text, params, {
    fullResults: true,
  });
  const rows = rawRows as Row[];
  const wide = fields.filter((field) => field.dataTypeID === BIGINT_OID);
  if (wide.length > 0) {
    for (const row of rows) {
      for (const field of wide) {
        const value = row[field.name];
        if (value != null && typeof value !== "number") {
          row[field.name] = Number(value);
        }
      }
    }
  }
  return rows;
}

// Tagged template: sql`SELECT ... WHERE id = ${id}` (values are always
// parameterized, never interpolated).
export function sql<R = Row>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<R[]> {
  const { query, params } = new SqlTemplate(strings, values).toParameterizedQuery();
  return run(query, params) as Promise<R[]>;
}

// Parameterized statement: query("SELECT ... WHERE id = $1", [id]).
export function query<R = Row>(
  text: string,
  params: unknown[] = [],
): Promise<R[]> {
  return run(text, params) as Promise<R[]>;
}

// Parameterized statement returning the first row (or undefined).
export async function queryOne<R = Row>(
  text: string,
  params: unknown[] = [],
): Promise<R | undefined> {
  return (await run(text, params))[0] as R | undefined;
}

// Run an INSERT/UPDATE/DELETE and return the affected row count.
export async function exec(
  text: string,
  params: unknown[] = [],
): Promise<number> {
  const result = await getDb().query(text, params, { fullResults: true });
  return result.rowCount ?? -1;
}

// One PostgreSQL transaction executed as a static batch. Neon's HTTP driver
// transactions are non-interactive: build all statements up-front (reads first,
// outside the transaction), then send them together.
export function tx<R = unknown>(
  statements: { text: string; params: unknown[] }[],
): Promise<R> {
  return getDb().transaction((t) =>
    statements.map((s) => t.query(s.text, s.params)),
  ) as Promise<R>;
}

// New row id (uuid is fine for every text id column).
export function id(): string {
  return crypto.randomUUID();
}

// Structural type for a row from the `channels` table (the fields the sync and
// actions layers read/write).
export interface ChannelRow {
  id: string;
  platform: string;
  username: string;
  externalId: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  lastSyncedAt: Date | null;
  lastSyncError: string | null;
  oldVideoCount: number;
  latestVideoCount: number;
  backfilled: boolean;
  minLikeRatio: number | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}