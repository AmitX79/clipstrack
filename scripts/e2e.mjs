import { chromium } from "playwright-core";

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3000";

const browser = await chromium.launch({
  executablePath: "/snap/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
page.setDefaultTimeout(20000);

const failures = [];
function check(name, pass, detail = "") {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!pass) failures.push(name);
}

const nav = (name) => page.getByRole("link", { name, exact: true });

try {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  check("home hero renders", await page.getByText("Every view, tracked.").isVisible());
  check("nav has All Accounts link", await nav("All Accounts").isVisible());

  // --- Add form: platform pill -> server action path + new count inputs ---
  check(
    "hidden platform input defaults to YOUTUBE",
    (await page.locator('input[name="platform"]').inputValue()) === "YOUTUBE",
  );
  check(
    "old videos count input present (default 8)",
    (await page.locator('input[name="oldVideoCount"]').inputValue()) === "8",
  );
  check(
    "latest videos count input present (default 8)",
    (await page.locator('input[name="latestVideoCount"]').inputValue()) === "8",
  );

  await page.getByRole("button", { name: "TikTok", exact: true }).click();
  check(
    "clicking TikTok pill updates hidden platform input",
    (await page.locator('input[name="platform"]').inputValue()) === "TIKTOK",
  );

  await page.locator('input[name="username"]').fill("mrbeast");
  await page.getByRole("button", { name: "Add Channel" }).click();
  await page.waitForTimeout(2500);

  // Add persists iff the channel row lands on the fresh visitor's /tracked page.
  await nav("Tracked accounts").click();
  await page.waitForURL(`${BASE}/tracked`);
  check(
    "tracked page heading renders",
    await page.getByText("Accounts you're following.").isVisible(),
  );
  await page.getByText("@mrbeast", { exact: true }).first().waitFor({ state: "visible" });
  check("TikTok add persists @mrbeast for the visitor", true);
  check(
    "platform pill on added card shows TikTok",
    await page.getByText("TikTok", { exact: true }).first().isVisible(),
  );

  // --- All Accounts (global) page: cards + URL search ---
  await nav("All Accounts").click();
  await page.waitForURL(`${BASE}/accounts`);
  check(
    "accounts page heading renders",
    await page.getByText("Every tracked account.").isVisible(),
  );
  await page.getByText("@mrbeast", { exact: true }).first().waitFor({ state: "visible" });
  check("accounts page shows @mrbeast rows", true);

  const search = page.getByRole("searchbox");
  await search.fill("mr");
  await page.waitForURL(new RegExp(`\\?q=mr`));
  await page.getByText("@mrbeast", { exact: true }).first().waitFor({ state: "visible" });
  check("search 'mr' keeps matches", true);

  await search.fill("zzzz");
  await page.waitForURL(new RegExp(`q=zzzz`));
  await page.getByText("No matches").first().waitFor({ state: "visible" });
  check("search 'zzzz' shows no-match state", true);

  await search.fill("");
  await page.waitForURL(`${BASE}/accounts`);
  await page.getByText("@mrbeast", { exact: true }).first().waitFor({ state: "visible" });
  check("clearing search restores rows", true);

  // --- Per-card management: Edit, Refresh, Remove (on a throwaway TikTok card) ---
  const ttCard = page
    .locator("article", { hasText: "@mrbeast" })
    .filter({ hasText: "TikTok" })
    .last();
  await ttCard.waitFor({ state: "attached" });
  const channelId = (await ttCard.getAttribute("data-channel-id")).replace(
    /"/g,
    "",
  );
  const byId = (id) => page.locator(`article[data-channel-id="${id}"]`);

  await ttCard.getByRole("button", { name: /^Edit @/ }).click();
  await page.locator('input[name="latestVideoCount"]').waitFor({ state: "visible" });
  await page.locator('input[name="latestVideoCount"]').fill("12");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForTimeout(2000);
  await byId(channelId).getByRole("button", { name: /^Edit @/ }).click();
  const editedValue = await page.locator('input[name="latestVideoCount"]').inputValue();
  check("Edit persists latest-videos count", editedValue === "12", editedValue);

  await page.getByRole("button", { name: "Cancel" }).click();
  await byId(channelId).getByRole("button", { name: /^Refresh @/ }).click();
  await page.waitForTimeout(4000);
  check(
    "Refresh runs without error (card stays)",
    await byId(channelId).getByRole("button", { name: /^Refresh @/ }).isVisible(),
  );

  const beforeRemoval = await byId(channelId).count();
  page.on("dialog", (dialog) => dialog.accept());
  await byId(channelId).getByRole("button", { name: /^Remove @/ }).click();
  await page.waitForTimeout(2500);
  const afterRemoval = await byId(channelId).count();
  check(
    "Remove deletes exactly one channel card",
    beforeRemoval === 1 && afterRemoval === 0,
    `${beforeRemoval} -> ${afterRemoval}`,
  );
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`\n${failures.length} assertion(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nAll e2e checks passed.");