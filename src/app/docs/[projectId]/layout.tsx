import type { Metadata } from 'next';

import { siteConfig } from '@/lib/site-config';

type Props = {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const title = 'Published API docs';

  return {
    title,
    description: `Public API documentation (${projectId}) generated with ${siteConfig.shortName}.`,
    alternates: {
      canonical: `/docs/${projectId}`,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | ${siteConfig.shortName}`,
      description: `Public API documentation (${projectId}) generated with ${siteConfig.shortName}.`,
      url: `/docs/${projectId}`,
    },
  };
}

export default function PublishedDocsLayout({ children }: Props) {
  return children;
}
