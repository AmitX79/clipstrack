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

// Consent banner shows before any interaction on a fresh, cookie-free visit.
const banner = page.getByRole("dialog");
await banner.waitFor();
const bannerTitle = await banner.locator("h2").innerText();
check("consent banner shows on first visit", /cookie/i.test(bannerTitle), bannerTitle);
await banner.getByRole("button", { name: /^Allow/ }).click();
await banner.waitFor({ state: "hidden" });
check("consent banner closes after Allow", true);
await page.waitForLoadState("networkidle");

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
check("ct_uid cookie set after Allow", cookies.some((c) => c.name === "ct_uid"));
check("ct_consent cookie set after Allow", cookies.some((c) => c.name === "ct_consent" && c.value === "1"));

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
const bonusForm = page.locator("#grant-bonus-form");
const dailyForm = page.locator("#grant-daily-form");
const bonusSave = bonusForm.locator('button[type="submit"]');
const dailySave = dailyForm.locator('button[type="submit"]');

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

// ---- 5. Add bonus credits (one-time top-up, separate form) -------------------
await page.locator("#grant-bonus").fill("25");
await bonusSave.click();
await bonusForm.getByText("Saved ✓").waitFor();
await grantCard.locator("text=incl. 25 bonus").waitFor();
const afterBonus = await grantCard.locator("text=Used today").innerText();
check("bonus 25 reflected in total", afterBonus.includes(String(baseLimit + 25)), afterBonus.trim());

// ---- 6. Set permanent daily limit (separate form) ------------------------------
await grantCard.locator("#grant-daily").fill("200");
await dailySave.click();
await dailyForm.getByText("Saved ✓").waitFor();
await grantCard.locator("text=daily limit 200").waitFor();
const afterDaily = await grantCard.locator("text=Used today").innerText();
check("daily limit 200 applied (total = 200 + 25 bonus)", afterDaily.includes("of 225"), afterDaily.trim());
const helperLine = await grantCard.locator("text=Permanent daily limit set: 200").innerText();
check("permanent-limit helper shown", helperLine.includes("replaces the global limit"), helperLine.trim());

// ---- 6b. Grant history records both changes ----------------------------------
const historyCard = page.locator("h2", { hasText: "Grant history" }).locator("xpath=ancestor::section");
await historyCard.waitFor();
const historyText = await historyCard.innerText();
check("history shows the bonus grant", historyText.includes("Bonus credits") && historyText.includes("+25"), historyText.slice(0, 200));
check("history shows the permanent daily limit", historyText.includes("Permanent daily limit") && historyText.includes("200"), historyText.slice(0, 200));
check("history shows the user code", historyText.includes(userCode), historyText.slice(0, 200));
check("inactive-account cleanup card present", (await page.locator("h2", { hasText: "Inactive-account cleanup" }).count()) === 1);
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

// ---- 9. Consent: decline blocks adding until re-agreed ---------------------
const ctx2 = await browser.newContext();
const page2 = await ctx2.newPage();
page2.setDefaultTimeout(30000);
const page2Errors = [];
page2.on("pageerror", (e) => page2Errors.push(String(e)));

await page2.goto(`${BASE}/accounts`, { waitUntil: "networkidle" });
const banner2 = page2.getByRole("dialog");
await banner2.waitFor();
check("consent banner shows on a fresh decline flow", true);
await banner2.getByRole("button", { name: /^Decline/ }).click();
await banner2.waitFor({ state: "hidden" });
check("decline closes the banner", true);

const declinedCookies = await ctx2.cookies();
check("decline sets no ct_uid cookie", !declinedCookies.some((c) => c.name === "ct_uid"));

await page2.locator("text=Agree to the cookie notice").waitFor();
await page2.locator('input[name="usernames"]').fill("@consenttest");
await page2.locator('button[type="submit"]').click();
await banner2.waitFor();
const blockedTitle = await banner2.locator("h2").innerText();
check("add attempt re-shows banner with agree-to-continue", blockedTitle.includes("Please agree to continue"), blockedTitle);
await banner2.getByRole("button", { name: /^Allow/ }).click();
await banner2.waitFor({ state: "hidden" });
check("agreeing unblocks the add", true);

const reConsentedCookies = await ctx2.cookies();
check("ct_uid set after re-agreeing", reConsentedCookies.some((c) => c.name === "ct_uid"));
check("no page errors (decline flow)", page2Errors.length === 0, page2Errors.join("; "));
await ctx2.close();

check("no page errors", pageErrors.length === 0, pageErrors.join("; "));

await browser.close();
console.log(failures.length ? `\n${failures.length} FAILURES` : "\nALL PASS");
process.exit(failures.length ? 1 : 0);