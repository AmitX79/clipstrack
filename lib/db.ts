import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

// DATABASE_URL scheme determines which driver adapter to use:
//
//   prisma+postgres://…   Local Prisma Postgres (`prisma dev`).
//                         The api_key embeds the underlying postgres:// TCP URL.
//
//   postgresql://…        Neon Postgres (or any standard Postgres).
//                         Uses the pg driver over TCP — full transaction support,
//                         works from the VPS cron job too.
//
// Usage elsewhere: `import { prisma } from "@/lib/db"`.

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function decodePrismaPostgresUrl(url: string): string {
  const parsed = new URL(url);
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
    // Local Prisma Postgres: one connection at a time — keep pool at 1.
    const adapter = new PrismaPg({
      connectionString: decodePrismaPostgresUrl(connectionString),
      max: 1,
    });
    return new PrismaClient({ adapter });
  }

  // Standard postgres:// (Neon pooler, direct Postgres, etc.).
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}