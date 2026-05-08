/** Canonical site origin for metadata, sitemap, and robots (no trailing slash). */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://rauts.xyz';
  return raw.replace(/\/+$/, '');
}

export const siteConfig = {
  name: 'Rauts',
  shortName: 'Rauts',
  title: 'Rauts — API discovery & docs from your codebase',
  description:
    'Point Rauts at your repo or run the CLI: discover every route, keep docs in sync with GitHub, and publish readable API docs—without maintaining OpenAPI by hand.',
};
