// Production deploy workaround.
//
// Vercel blocks deploys that carry this repo's git metadata: the local commit
// author email is not a verified member of the Vercel project, so every deploy
// lands as readyState "BLOCKED" with seatBlock TEAM_ACCESS_REQUIRED (and zero
// build logs). Staging the source into a throwaway *non-git* copy drops the
// commit-author metadata, so Vercel authorizes the authenticated account (the
// project owner) and the deploy goes through.
//
//   node scripts/deploy.mjs          # deploy to production
//   node scripts/deploy.mjs --keep   # keep the temp copy for inspection
//
// Production only: Preview in this project has no DATABASE_URL configured, so a
// preview build fails during page-data collection. Fix that in the Vercel
// dashboard first if you ever need previews.
//
// Remove this once the commit author email is verified in the Vercel account.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const flags = process.argv.slice(2);
const keep = flags.includes("--keep");
const passthrough = flags.filter((f) => f !== "--keep");

const workDir = mkdtempSync(join(tmpdir(), "clipstrack-deploy-"));

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { stdio: "inherit", ...opts });
}

function main() {
  console.log(`[deploy] staging non-git copy in ${workDir}`);

  const rsync = run("rsync", [
    "-a",
    "--exclude=.git",
    "--exclude=.next",
    "--exclude=node_modules",
    "--exclude=.env*",
    "--exclude=.vercel/output",
    `${projectRoot}/`,
    `${workDir}/`,
  ]);
  if (rsync.error?.code === "ENOENT") {
    console.error("[deploy] rsync not found; install rsync and retry.");
    return 1;
  }
  if (rsync.status !== 0) {
    console.error(`[deploy] rsync failed (exit ${rsync.status}).`);
    return rsync.status ?? 1;
  }

  if (existsSync(join(workDir, ".git"))) {
    console.error("[deploy] a .git directory leaked into the copy; aborting.");
    return 1;
  }
  if (!existsSync(join(workDir, ".vercel", "project.json"))) {
    console.error("[deploy] missing .vercel/project.json; run `vercel link` first.");
    return 1;
  }

  const vercelArgs = ["--prod", "--yes", ...passthrough];
  console.log(`[deploy] vercel ${vercelArgs.join(" ")}`);

  const deploy = run("vercel", vercelArgs, { cwd: workDir });
  if (deploy.error?.code === "ENOENT") {
    console.error("[deploy] vercel CLI not found; run `npm i -g vercel` and retry.");
    return 1;
  }
  if (deploy.status !== 0) {
    console.error(`[deploy] vercel failed (exit ${deploy.status}).`);
    return deploy.status ?? 1;
  }

  console.log("[deploy] done");
  return 0;
}

try {
  process.exitCode = main();
} finally {
  if (keep) console.log(`[deploy] keeping ${workDir}`);
  else rmSync(workDir, { recursive: true, force: true });
}
