// Daily inactivity cleanup ("who still uses the app"). A visitor is kept alive
// by any activity - loading /accounts, adding a channel, or refreshing/editing/
// removing one - each stamps their User.lastActive. The daily cron deletes
// visitors who have been silent for INACTIVE_DAYS consecutive days: their
// Channel rows and everything cascading off them (videos, video + channel
// snapshots), their credit-usage rows, and the visitor identity rows.
//
// GrantHistory rows are intentionally kept: the audit trail must survive its
// owner being purged, so GrantHistory is never touched here. The deletion is
// summarized in CleanupLog (counts only, no per-user history), as requested.

import { id, query } from "./db";

export const INACTIVE_DAYS = 5;

export interface CleanupResult {
  deletedUsers: number;
  deletedChannels: number;
}

export async function runCleanup(): Promise<CleanupResult> {
  const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000);
  const users = await query<{ id: string; comboHash: string | null }>(
    `SELECT id, "comboHash" FROM users WHERE "lastActive" < $1`,
    [cutoff],
  );

  if (users.length === 0) {
    console.log(
      `[cleanup] no inactive users (cutoff ${cutoff.toISOString()}, ${INACTIVE_DAYS} days)`,
    );
    await query(
      `INSERT INTO cleanup_logs (id, "runAt", "deletedUsers", "deletedChannels")
       VALUES ($1, now(), 0, 0)`,
      [id()],
    );
    return { deletedUsers: 0, deletedChannels: 0 };
  }

  const userIds = users.map((user) => user.id);

  // Identity rows hold the current combo too; both are combos to clear credits
  // for. Different ct_uid cookies hash differently, so a combo only ever maps
  // to one visitor - stale rows can be removed without touching live budgets.
  const codes = await query<{ comboHash: string | null }>(
    `SELECT "comboHash" FROM user_codes WHERE "userId" = ANY($1)`,
    [userIds],
  );
  const combos = new Set<string>();
  for (const user of users) if (user.comboHash) combos.add(user.comboHash);
  for (const code of codes) if (code.comboHash) combos.add(code.comboHash);

  // Channel counts per user, so the summary stays exact.
  const counts = await query<{ userId: string; count: number }>(
    `SELECT "userId", count(*) AS count FROM channels WHERE "userId" = ANY($1) GROUP BY "userId"`,
    [userIds],
  );
  const deletedChannels = counts.reduce((sum, row) => sum + row.count, 0);

  const comboList = Array.from(combos);
  if (comboList.length > 0) {
    await query(
      `DELETE FROM credit_usage WHERE "comboHash" = ANY($1)`,
      [comboList],
    );
  }
  await query(`DELETE FROM user_codes WHERE "userId" = ANY($1)`, [userIds]);
  // Channels/videos/snapshots cascade off the user via their FK relationships.
  const result = await query<{ id: string }>(
    `DELETE FROM users WHERE id = ANY($1) RETURNING id`,
    [userIds],
  );
  const deletedUsers = result.length;

  await query(
    `INSERT INTO cleanup_logs (id, "runAt", "deletedUsers", "deletedChannels")
     VALUES ($1, now(), $2, $3)`,
    [id(), deletedUsers, deletedChannels],
  );
  console.log(
    `[cleanup] deleted ${deletedUsers} visitor(s), ${deletedChannels} channel(s) ` +
      `(cutoff ${cutoff.toISOString()})`,
  );
  return { deletedUsers, deletedChannels };
}