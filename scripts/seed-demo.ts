// Dev utility: seed a demo visitor with a few accounts so the dashboard
// renders realistic stats. Run: npm run db:seed-demo
import "dotenv/config";
import { id, query, queryOne, type ChannelRow } from "../lib/db";

const DEMO_USER_ID = "cliptrack-demo";

export async function seedDemo(): Promise<void> {
  await query(
    `INSERT INTO users (id, "lastActive", "createdAt", "updatedAt")
     VALUES ($1, now(), now(), now())
     ON CONFLICT (id) DO NOTHING`,
    [DEMO_USER_ID],
  );

  const upsertChannel = async (input: {
    platform: string;
    username: string;
    displayName: string;
    externalId: string;
    profileUrl: string;
  }): Promise<ChannelRow> => {
    const row = await queryOne<ChannelRow>(
      `INSERT INTO channels (
         id, "userId", platform, username, "displayName", "externalId",
         "profileUrl", "lastSyncedAt", "oldVideoCount", "latestVideoCount",
         "backfilled", "createdAt", "updatedAt"
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, now(), 8, 8, true, now(), now())
       ON CONFLICT ("userId", platform, username) DO UPDATE SET
         "lastSyncedAt" = now(),
         "updatedAt" = now()
       RETURNING *`,
      [
        id(),
        DEMO_USER_ID,
        input.platform,
        input.username,
        input.displayName,
        input.externalId,
        input.profileUrl,
      ],
    );
    return row!;
  };

  const mrbeast = await upsertChannel({
    platform: "YOUTUBE",
    username: "mrbeast",
    displayName: "MrBeast",
    externalId: "UCX6OQ3DkcsbYNE6H8uQQuVA",
    profileUrl: "https://www.youtube.com/@mrbeast",
  });

  await query(
    `INSERT INTO channel_snapshots (id, "channelId", followers, following, "totalPosts", "totalViews", "recordedAt")
     VALUES ($1, $2, $3, $4, $5, $6, now())`,
    [id(), mrbeast.id, 339_000_000, 84, 1_917, BigInt(78_500_000_000)],
  );
  const demos = [
    { title: "Beast Games - $5,000,000 Episode", url: "https://www.youtube.com/watch?v=demo1" },
    { title: "I Gave Away $1,000,000", url: "https://www.youtube.com/watch?v=demo2" },
    { title: "Last To Leave Circle Wins $500,000", url: "https://www.youtube.com/watch?v=demo3" },
  ];
  for (let i = 0; i < demos.length; i++) {
    const { title, url } = demos[i];
    const video = await queryOne<{ id: string }>(
      `INSERT INTO videos (id, "channelId", "externalId", title, url, "publishedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, now(), now())
       ON CONFLICT ("channelId", "externalId") DO UPDATE SET
         title = $4, url = $5, "updatedAt" = now()
       RETURNING id`,
      [
        id(),
        mrbeast.id,
        `demo-${i + 1}`,
        title,
        url,
        new Date(Date.now() - (i + 1) * 86400_000),
      ],
    );
    await query(
      `INSERT INTO video_snapshots (id, "videoId", views, likes, comments, "recordedAt")
       VALUES ($1, $2, $3, $4, $5, now())`,
      [id(), video!.id, BigInt(210_000_000 - i * 40_000_000), 8_500_000 - i * 900_000, 210_000 - i * 40_000],
    );
  }

  const insta = await upsertChannel({
    platform: "INSTAGRAM",
    username: "mrbeast",
    displayName: "MrBeast",
    externalId: "mrbeast",
    profileUrl: "https://www.instagram.com/mrbeast/",
  });
  await query(
    `INSERT INTO channel_snapshots (id, "channelId", followers, following, "totalPosts", "recordedAt")
     VALUES ($1, $2, $3, $4, $5, now())`,
    [id(), insta.id, 44_000_000, 350, 620],
  );

  console.log(`[seed-demo] ready — user "${DEMO_USER_ID}" with 2 accounts`);
}

if (process.argv[1]?.endsWith("seed-demo.ts")) {
  seedDemo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[seed-demo] failed:", err);
      process.exit(1);
    });
}