import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const host = new URL(base).host;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/dashboard/', '/auth', '/auth/', '/api'],
      },
    ],
    host,
    sitemap: `${base}/sitemap.xml`,
  };
}
