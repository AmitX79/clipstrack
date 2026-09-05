import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/client";

// Prisma Client wired to Neon's fetch-based HTTP driver, so the same client
// works in the Next.js runtime (Cloudflare Pages / workerd) and on the VPS
// cron job. HTTP mode has no interactive transactions — that's fine here.
//
// Usage elsewhere: `import { prisma } from "@/lib/db"`.

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaNeonHttp(connectionString, {});
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}