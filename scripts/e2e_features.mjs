import { chromium } from "playwright-core";
import { readFileSync, appendFileSync } from "fs";

const BASE = process.env.E2E_BASE ?? "http://127.0.0.1:4000";
const ADMIN_SECRET = readFileSync("/home/ubuntu/clipstrack/.env", "utf8")
  .split("\n")
  .map((l) => l.trim())
  .find((l) => l.startsWith("ADMIN_SECRET="))
  ?.slice("ADMIN_SECRET=".length);

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
page.on("pageerror", (error) => pageErrors.push(String(error)));

// ---- 1. Fresh /accounts visit --------------------------------------------
await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle" });

const title = await page.locator("h1").innerText();
check("h1 shows tracked title", title.includes("The handles you track."), title);

const badge = page.locator('button[aria-haspopup="dialog"]');
await badge.waitFor();
const badgeText = await badge.innerText();
const badgeMatch = badgeText.match(/IG\+TikTok\s+0\/(\d+)/);
check("badge shows credit usage 0/limit", !!badgeMatch, badgeText.trim());
const baseLimit = badgeMatch ? Number(badgeMatch[1]) : NaN;
console.log(`   (initial daily limit detected: ${baseLimit})`);

const yourId = await page.locator("p", { hasText: "Your ID:" }).innerText();
const codeMatch = yourId.match(/CT-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}/);
check("User ID shown as CT-XXXXXX", !!codeMatch, yourId);
const userCode = codeMatch ? codeMatch[0] : "";
appendFileSync("/tmp/opencode/test_code.txt", `${userCode}\n`);

const cookies = await page.context().cookies();
check("ct_uid cookie set on first visit", cookies.some((c) => c.name === "ct_uid"));

// ---- Header placement: badge on the h1 row, right edge = navbar CTA ------
const h1b = await page.locator("h1").boundingBox();
const badgeb = await badge.boundingBox();
const add = page.locator('a.inline-flex[href$="#add"]');
const addb = await add.boundingBox();
if (h1b && badgeb && addb) {
  const sameRow =
    h1b.y < badgeb.y + badgeb.height && h1b.y + h1b.height > badgeb.y;
  check("badge shares the h1 row", sameRow);
  const rightAligned = Math.abs(badgeb.x + badgeb.width - (addb.x + addb.width)) <= 3;
  check("badge right edge aligns with navbar Add-channel", rightAligned,
    `badge right=${Math.round(badgeb.x + badgeb.width)} nav right=${Math.round(addb.x + addb.width)}`);
} else {
  check("badge/h1/nav boxes measurable", false, JSON.stringify({ h1b, badgeb, addb }));
}
await page.screenshot({ path: "/tmp/opencode/accounts-header.png", fullPage: true });

// ---- 2. Admin login --------------------------------------------------------
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
if (await page.locator('#secret').count()) {
  check("admin login available", true);
  await page.locator("#secret").fill(ADMIN_SECRET ?? "");
  await page.locator('button[type="submit"]').click();
  await page.locator('h1:has-text("Dashboard")').waitFor();
} else {
  check("admin already signed in (cookie)", true);
}
await page.locator("h1", { hasText: "Dashboard" }).waitFor();
check("admin dashboard open", true);

const grantCard = page.locator("text=Grant credits to a visitor").locator("xpath=ancestor::section");
await grantCard.waitFor();
const grantSearchForm = page.locator("#grant-search-form");
const grantEditForm = page.locator("#grant-edit-form");
const saveBtn = grantEditForm.locator('button[type="submit"]');

// ---- 3. Invalid code search error -----------------------------------------
await page.locator("#grant-code").fill("CT-NOT-A-CODE");
await grantSearchForm.getByRole("button", { name: /^Search/ }).click();
await grantCard.locator("text=valid User ID").waitFor();
check("invalid code shows error", true);

// ---- 4. Search by User ID ---------------------------------------------------
await page.locator("#grant-code").fill(userCode);
await grantSearchForm.locator('button[type="submit"]:not([disabled])').click();
await grantCard.locator("text=Used today").waitFor();
const usageRowText = await grantCard.locator(".flex.flex-wrap.items-baseline").innerText();
check("usage line shows the visitor + today usage", usageRowText.includes("0 of 100"), usageRowText.trim());
check("usage line shows the visitor User ID", usageRowText.includes(userCode), usageRowText.trim());

// ---- 5. Add bonus credits ----------------------------------------------------
await page.locator("#grant-bonus").fill("25");
await saveBtn.click();
await grantEditForm.locator('button[type="submit"]').click();
await grantEditForm.getByText("Saved ✓").waitFor();
await grantCard.locator("text=incl. 25 bonus").waitFor();
const afterBonus = await grantCard.locator("text=Used today").innerText();
check("bonus 25 reflected in total", afterBonus.includes(String(baseLimit + 25)), afterBonus.trim());

// ---- 6. Set daily limit override ---------------------------------------------
await grantCard.locator("#grant-override").fill("200");
await saveBtn.click();
await grantEditForm.locator('button[type="submit"]', { hasText: "Saved ✓" }).waitFor();
await grantCard.locator("text=override 200").waitFor();
const afterOverride = await grantCard.locator("text=Used today").innerText();
check("override 200 applied (total = 200 + 25 bonus)", afterOverride.includes("of 225"), afterOverride.trim());
await page.screenshot({ path: "/tmp/opencode/admin-grant.png", fullPage: true });

// ---- 7. Visitor's /accounts reflects granted budget ----------------------------
await page.goto(`${BASE}/accounts`, { waitUntil: "networkidle" });
await badge.waitFor();
const badgeAfter = await badge.innerText();
check("visitor badge now shows granted limit 0/225", /IG\+TikTok\s+0\/225/.test(badgeAfter), badgeAfter.trim());
const yourIdAfter = await page.locator("p", { hasText: "Your ID:" }).innerText();
check("User ID unchanged", yourIdAfter.includes(userCode), yourIdAfter);

// ---- 8. Error states -----------------------------------------------------------
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
await page.locator("text=Grant credits to a visitor").waitFor();
const grantCard2 = page.locator("text=Grant credits to a visitor").locator("xpath=ancestor::section");
await grantCard2.locator("#grant-code").fill("CT-999999");
await page.locator("#grant-search-form").locator('button[type="submit"]:not([disabled])').click();
await grantCard2.locator("text=No visitor with the ID").waitFor();
check("unknown code shows not-found error", true);

check("no page errors", pageErrors.length === 0, pageErrors.join("; "));

await browser.close();
console.log(failures.length ? `\n${failures.length} FAILURES` : "\nALL PASS");
process.exit(failures.length ? 1 : 0);