import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

// Two supported database styles, chosen by the DATABASE_URL scheme:
//
//   prisma+postgres://…      Local Prisma Postgres (`prisma dev`). The
//                            api_key payload embeds the underlying postgres://
//                            TCP URL, which we connect to with the pg driver
//                            adapter.
//   postgresql://… (Neon)    Remote Neon Postgres, wired through the fetch-based
//                            HTTP driver so the same client runs on the VPS cron
//                            too. HTTP mode has no interactive transactions —
//                            fine here.
//
// Usage elsewhere: `import { prisma } from "@/lib/db"`.

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function decodePrismaPostgresUrl(connectionString: string): string {
  const parsed = new URL(connectionString);
  const key = parsed.searchParams.get("api_key");
  if (!key) {
    throw new Error("prisma+postgres:// URL is missing api_key");
  }
  const decoded = Buffer.from(key, "base64url").toString("utf8");
  const payload = JSON.parse(decoded) as { databaseUrl?: string };
  if (!payload.databaseUrl) {
    throw new Error("api_key payload has no databaseUrl");
  }
  return payload.databaseUrl;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (connectionString.startsWith("prisma+postgres://")) {
    // Local Prisma Postgres exposes one connection at a time — keep the pool
    // to a single slot to avoid queuing stalls in the web runtime.
    const adapter = new PrismaPg({
      connectionString: decodePrismaPostgresUrl(connectionString),
      max: 1,
    });
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaNeonHttp(connectionString, {});
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}