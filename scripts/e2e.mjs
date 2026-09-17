import { chromium } from "playwright-core";

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:3000";

const browser = await chromium.launch({
  executablePath: "/snap/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
page.setDefaultTimeout(30000);

const failures = [];
function check(name, pass, detail = "") {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!pass) failures.push(name);
}

const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

const waitForTracked = () =>
  page.waitForURL((url) => url.pathname === "/tracked");

try {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  check("home hero renders", await page.getByText("Every view, tracked.").isVisible());
  check(
    "add bar stays off the homepage",
    (await page.getByPlaceholder("Add channels… e.g. @mrbeast, @veritasium").count()) === 0,
  );
  check(
    "hero has Add a channel button",
    await page.getByRole("link", { name: "Add a channel" }).first().isVisible(),
  );
  check(
    "hero has View my accounts button",
    await page.getByRole("link", { name: "View my accounts" }).first().isVisible(),
  );
  check(
    "nav has My Accounts link",
    await page.getByRole("link", { name: "My Accounts", exact: true }).isVisible(),
  );
  check(
    "nav no longer has All Accounts link",
    (await page.getByRole("link", { name: "All Accounts", exact: true }).count()) === 0,
  );

  // --- The add bar lives on My Accounts /tracked ---
  await page.getByRole("link", { name: "Add a channel" }).first().click();
  await waitForTracked();
  await page.getByText("The handles you track.").waitFor({ state: "visible" });
  check("tracked heading renders", true);

  check(
    "add bar input visible on My Accounts",
    await page.getByPlaceholder("Add channels… e.g. @mrbeast, @veritasium").isVisible(),
  );
  check(
    "+ Add button visible on My Accounts",
    await page.getByRole("button", { name: "+ Add", exact: true }).isVisible(),
  );
  check(
    "helper text below the bar renders",
    await page.getByText(/Separate handles with commas/).isVisible(),
  );

  // --- Platform picker: default YouTube, switch to TikTok ---
  for (const label of ["YouTube", "Instagram", "TikTok"]) {
    check(`platform pill ${label} renders`, await page.getByRole("button", { name: label, exact: true }).isVisible());
  }
  check(
    "YouTube pill selected by default",
    await page.getByRole("button", { name: "YouTube", exact: true }).evaluate((el) => el.getAttribute("aria-pressed")) === "true",
  );
  await page.getByRole("button", { name: "TikTok", exact: true }).click();
  check(
    "hidden platform input follows TikTok pill",
    (await page.locator('input[name="platform"]').inputValue()) === "TIKTOK",
  );

  check(
    "old videos count default 8",
    (await page.getByRole("spinbutton", { name: "Old videos count" }).inputValue()) === "8",
  );
  check(
    "latest videos count default 8",
    (await page.getByRole("spinbutton", { name: "Latest videos count" }).inputValue()) === "8",
  );

  // --- Multi-add: comma-separated handles in one action ---
  // Both handles are added on the selected platform (TikTok). A nonexistent
  // handle is still saved with the same pill so it shows up immediately.
  const ghost = "faux" + Date.now().toString(36);
  await page
    .getByPlaceholder("Add channels… e.g. @mrbeast, @veritasium")
    .fill(`mrbeast, ${ghost}`);
  await page.getByRole("button", { name: "+ Add", exact: true }).click();

  const status = page.locator('[aria-live="polite"] p');
  await status.filter({ hasText: /@mrbeast/ }).waitFor({ state: "visible", timeout: 150000 });
  const statusText = await status.filter({ hasText: /@mrbeast/ }).first().innerText();
  check("multi-add reports @mrbeast", /@mrbeast/.test(statusText), statusText);
  check("multi-add reports fallback handle", new RegExp(`@${ghost}`).test(statusText), statusText);
  check(
    "usernames input cleared after add",
    (await page.getByPlaceholder("Add channels… e.g. @mrbeast, @veritasium").inputValue()) === "",
  );

  // --- Both persist on the page with the picked platform's pill ---
  await page.getByText("@mrbeast", { exact: true }).first().waitFor({ state: "visible" });
  await page.getByText(`@${ghost}`, { exact: true }).first().waitFor({ state: "visible" });
  check("both handles persisted for the visitor", true);

  const mrbeastCard = page
    .locator("article", { hasText: "@mrbeast" })
    .filter({ hasText: "TikTok" });
  const ghostCard = page
    .locator("article", { hasText: `@${ghost}` })
    .filter({ hasText: "TikTok" });
  check(
    "mrbeast card shows TikTok pill (picked platform)",
    await mrbeastCard.getByText("TikTok", { exact: true }).isVisible(),
  );
  check(
    "ghost handle also shows TikTok pill (picked platform)",
    await ghostCard.getByText("TikTok", { exact: true }).isVisible(),
  );

  const bodyText = await page.locator("body").innerText();
  check(
    "no follower/subscriber counts anywhere",
    !/followers|subscribers/i.test(bodyText),
  );

  // --- Sort by control ---
  check(
    "sort select defaults to Newest first",
    (await page.locator("select").inputValue()) === "published",
  );
  check(
    "sort select has 4 options",
    (await page.locator("select option").count()) === 4,
  );
  await page.locator("select").selectOption("views");
  check(
    "sort select switches to Most views",
    (await page.locator("select").inputValue()) === "views",
  );

  // --- Per-card management: Edit, Refresh, Remove ---
  await mrbeastCard.last().waitFor({ state: "attached" });
  const channelId = (await mrbeastCard.last().getAttribute("data-channel-id")).replace(
    /"/g,
    "",
  );
  const byId = (id) => page.locator(`article[data-channel-id="${id}"]`);

  await byId(channelId).getByRole("button", { name: /^Edit @/ }).click();
  const editInput = byId(channelId).locator('input[name="latestVideoCount"]');
  await editInput.waitFor({ state: "visible" });
  await editInput.fill("12");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForTimeout(1500);
  await byId(channelId).getByRole("button", { name: /^Edit @/ }).click();
  const editedValue = await byId(channelId)
    .locator('input[name="latestVideoCount"]')
    .inputValue();
  check("Edit persists latest-videos count", editedValue === "12", editedValue);

  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await byId(channelId).getByRole("button", { name: /^Refresh @/ }).click();
  await page.waitForTimeout(3000);
  check(
    "Refresh runs without error (card stays)",
    await byId(channelId).getByRole("button", { name: /^Refresh @/ }).isVisible(),
  );

  page.once("dialog", (dialog) => dialog.accept());
  await byId(channelId).getByRole("button", { name: /^Remove @/ }).click();
  await page
    .getByText("@mrbeast", { exact: true })
    .first()
    .waitFor({ state: "detached", timeout: 30000 });
  check("Remove deletes mrbeast card", (await byId(channelId).count()) === 0);
  await page.getByText(`@${ghost}`, { exact: true }).first().waitFor({ state: "visible" });
  check("fallback card survives removal of sibling", true);

  page.once("dialog", (dialog) => dialog.accept());
  await page
    .locator("article", { hasText: `@${ghost}` })
    .getByRole("button", { name: /^Remove @/ })
    .click();
  await page
    .getByText("Your tracked accounts will appear here.")
    .waitFor({ state: "visible", timeout: 30000 });
  check("empty state returns after removing all", true);

  // --- Instagram live fetch (ScrapeCreators, key from .env) ---
  await page.getByRole("button", { name: "Instagram", exact: true }).click();
  await page
    .getByPlaceholder("Add channels… e.g. @mrbeast, @veritasium")
    .fill("mrbeast");
  await page.getByRole("button", { name: "+ Add", exact: true }).click();
  const igStatus = page.locator('[aria-live="polite"] p');
  await igStatus
    .filter({ hasText: /@mrbeast/ })
    .waitFor({ state: "visible", timeout: 150000 });
  await page.getByText("@mrbeast", { exact: true }).first().waitFor({ state: "visible" });
  const igCard = page
    .locator("article", { hasText: "@mrbeast" })
    .filter({ hasText: "Instagram" });
  await igCard.waitFor({ state: "visible" });
  await igCard.getByText(/Views/i).first().waitFor({ state: "visible", timeout: 60000 });
  const igCardText = await igCard.innerText();
  check("IG card renders with Instagram pill instead of TikTok", /Instagram/i.test(igCardText));
  check("IG card renders Views stat", /Views/i.test(igCardText), "Views label");
  check(
    "IG card renders Likes stat",
    /Likes/i.test(igCardText),
    "Likes label",
  );
  check(
    "IG card renders Comments stat",
    /Comments/i.test(igCardText),
    "Comments label",
  );

  page.once("dialog", (dialog) => dialog.accept());
  const igChannelId = (await igCard.getAttribute("data-channel-id")).replace(/"/g, "");
  await igCard.getByRole("button", { name: /^Remove @/ }).click();
  await page
    .getByText("Your tracked accounts will appear here.")
    .waitFor({ state: "visible", timeout: 30000 });
  check("empty state returns after removing IG channel", true);

  // --- Runtime sanity: no hydration errors / page errors ---
  const realConsoleErrors = consoleErrors.filter(
    (text) => !/favicon/i.test(text) && !/net::ERR/i.test(text),
  );
  check("no page errors", pageErrors.length === 0, pageErrors.join(" | ").slice(0, 200));
  check("no console errors", realConsoleErrors.length === 0, realConsoleErrors.join(" | ").slice(0, 200));
} finally {
  await browser.close();
}

if (failures.length > 0) {
  console.error(`\n${failures.length} assertion(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nAll e2e checks passed.");