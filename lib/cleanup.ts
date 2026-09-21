// Daily inactivity cleanup ("who still uses the app"). A visitor is kept alive
// by any activity - loading /accounts, adding a channel, or refreshing/editing/
// removing one - each stamps their User.lastActive. The daily cron deletes
// visitors who have been silent for INACTIVE_DAYS consecutive days: their
// Channel rows and everything cascading off them (videos, video + channel
// snapshots), their credit-usage rows, and the visitor identity rows.
//
// GrantHistory rows are intentionally kept: the audit trail must survive its
// owner being purged, so GrantHistory is not a Prisma relation and is never
// touched here. The deletion is summarized in CleanupLog (counts only, no
// per-user history), as requested.

import { prisma } from "./db";

export const INACTIVE_DAYS = 5;

export interface CleanupResult {
  deletedUsers: number;
  deletedChannels: number;
}

export async function runCleanup(): Promise<CleanupResult> {
  const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000);
  const users = await prisma.user.findMany({
    where: { lastActive: { lt: cutoff } },
    select: { id: true, comboHash: true },
  });

  if (users.length === 0) {
    console.log(
      `[cleanup] no inactive users (cutoff ${cutoff.toISOString()}, ${INACTIVE_DAYS} days)`,
    );
    await prisma.cleanupLog.create({
      data: { deletedUsers: 0, deletedChannels: 0 },
    });
    return { deletedUsers: 0, deletedChannels: 0 };
  }

  const userIds = users.map((user) => user.id);

  // Identity rows hold the current combo too; both are combos to clear credits
  // for. Different ct_uid cookies hash differently, so a combo only ever maps
  // to one visitor - stale rows can be removed without touching live budgets.
  const codes = await prisma.userCode.findMany({
    where: { userId: { in: userIds } },
    select: { comboHash: true },
  });
  const combos = new Set<string>();
  for (const user of users) if (user.comboHash) combos.add(user.comboHash);
  for (const code of codes) if (code.comboHash) combos.add(code.comboHash);

  let deletedUsers = 0;
  let deletedChannels = 0;
  const comboList = Array.from(combos);
  for (const user of users) {
    const channels = await prisma.channel.count({ where: { userId: user.id } });
    await prisma.creditUsage.deleteMany({
      where: { comboHash: { in: comboList } },
    });
    await prisma.userCode.deleteMany({ where: { userId: user.id } });
    const result = await prisma.user.deleteMany({ where: { id: user.id } });
    deletedUsers += result.count;
    deletedChannels += channels;
  }

  await prisma.cleanupLog.create({
    data: { deletedUsers, deletedChannels },
  });
  console.log(
    `[cleanup] deleted ${deletedUsers} visitor(s), ${deletedChannels} channel(s) ` +
      `(cutoff ${cutoff.toISOString()})`,
  );
  return { deletedUsers, deletedChannels };
}