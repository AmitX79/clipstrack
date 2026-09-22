// Canonical site origin. Set SITE_URL at build/deploy time (Vercel env,
// wrangler vars, .env) once the final domain is live; until then it falls
// back to the legacy Vercel origin so metadata/sitemap never break.
export function siteUrl(): string {
  return process.env.SITE_URL ?? "https://clipstrack.vercel.app";
}