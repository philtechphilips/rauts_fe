import type { Metadata } from 'next';

import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Published docs',
  description: `Example published API documentation powered by ${siteConfig.shortName}.`,
  alternates: {
    canonical: '/docs',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `Published docs | ${siteConfig.shortName}`,
    description: `Example published API documentation powered by ${siteConfig.shortName}.`,
    url: '/docs',
  },
};

export default function DocsSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
