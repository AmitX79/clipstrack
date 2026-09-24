// Canonical site origin. Set SITE_URL at build/deploy time (.env, wrangler
// vars, GH Actions "variable") — the production domain is clipstrack.com. The
// local fallback keeps metadata/sitemap correct for builds that skip .env.
export function siteUrl(): string {
  return process.env.SITE_URL ?? "https://clipstrack.com";
}