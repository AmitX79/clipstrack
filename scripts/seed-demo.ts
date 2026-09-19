// Dev utility: seed a demo visitor with a few accounts so the dashboard
// renders realistic stats. Run: npm run db:seed-demo
import "dotenv/config";
import { prisma } from "../lib/db";

const DEMO_USER_ID = "cliptrack-demo";

export async function seedDemo(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    create: { id: DEMO_USER_ID },
    update: {},
  });

  const mrbeast = await prisma.channel.upsert({
    where: { userId_platform_username: { userId: user.id, platform: "YOUTUBE", username: "mrbeast" } },
    create: {
      userId: user.id,
      platform: "YOUTUBE",
      username: "mrbeast",
      displayName: "MrBeast",
      externalId: "UCX6OQ3DkcsbYNE6H8uQQuVA",
      profileUrl: "https://www.youtube.com/@mrbeast",
      lastSyncedAt: new Date(),
    },
    update: { lastSyncedAt: new Date() },
  });

  await prisma.channelSnapshot.create({
    data: {
      channelId: mrbeast.id,
      followers: 339_000_000,
      following: 84,
      totalPosts: 1_917,
      totalViews: BigInt(78_500_000_000),
      recordedAt: new Date(),
    },
  });
  const demos = [
    { title: "Beast Games - $5,000,000 Episode", url: "https://www.youtube.com/watch?v=demo1" },
    { title: "I Gave Away $1,000,000", url: "https://www.youtube.com/watch?v=demo2" },
    { title: "Last To Leave Circle Wins $500,000", url: "https://www.youtube.com/watch?v=demo3" },
  ];
  for (let i = 0; i < demos.length; i++) {
    const { title, url } = demos[i];
    const video = await prisma.video.upsert({
      where: { channelId_externalId: { channelId: mrbeast.id, externalId: `demo-${i + 1}` } },
      create: {
        channelId: mrbeast.id,
        externalId: `demo-${i + 1}`,
        title,
        url,
        publishedAt: new Date(Date.now() - (i + 1) * 86400_000),
      },
      update: {},
    });
    await prisma.videoSnapshot.create({
      data: {
        videoId: video.id,
        views: BigInt(210_000_000 - i * 40_000_000),
        likes: 8_500_000 - i * 900_000,
        comments: 210_000 - i * 40_000,
        recordedAt: new Date(),
      },
    });
  }

  const insta = await prisma.channel.upsert({
    where: { userId_platform_username: { userId: user.id, platform: "INSTAGRAM", username: "mrbeast" } },
    create: {
      userId: user.id,
      platform: "INSTAGRAM",
      username: "mrbeast",
      displayName: "MrBeast",
      externalId: "mrbeast",
      profileUrl: "https://www.instagram.com/mrbeast/",
      lastSyncedAt: new Date(),
    },
    update: { lastSyncedAt: new Date() },
  });
  await prisma.channelSnapshot.create({
    data: {
      channelId: insta.id,
      followers: 44_000_000,
      following: 350,
      totalPosts: 620,
      recordedAt: new Date(),
    },
  });

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