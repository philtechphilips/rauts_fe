import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

import AppShell from '@/components/layout/AppShell';
import { getSiteUrl, siteConfig } from '@/lib/site-config';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const siteOrigin = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.shortName,
  keywords: [
    'API documentation',
    'API discovery',
    'OpenAPI',
    'REST',
    'CLI',
    'GitHub',
    'developer tools',
    'Rauts',
  ],
  authors: [{ name: siteConfig.name, url: siteOrigin }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    shortcut: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: siteConfig.shortName,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1A1A1A',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteOrigin}/#website`,
      url: siteOrigin,
      name: siteConfig.shortName,
      description: siteConfig.description,
      publisher: { '@id': `${siteOrigin}/#organization` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Organization',
      '@id': `${siteOrigin}/#organization`,
      name: siteConfig.name,
      url: siteOrigin,
      logo: `${siteOrigin}/logo.svg`,
    },
    {
      '@type': 'SoftwareApplication',
      name: siteConfig.name,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      description: siteConfig.description,
      url: siteOrigin,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full scroll-smooth antialiased`}
    >
      <body
        className="h-screen overflow-hidden text-white selection:bg-accent selection:text-black"
        style={{ background: '#1A1A1A' }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
