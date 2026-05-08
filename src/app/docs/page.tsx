'use client';

import { PublishedDocsViewer } from '@/components/published-docs/PublishedDocsViewer';
import { DEMO_PUBLISHED_DOCS } from './demo-published-docs';

/** Sample layout; publish your own from the workspace → `/docs/[projectId]`. */
export default function DocsLandingPage() {
  return <PublishedDocsViewer data={DEMO_PUBLISHED_DOCS} />;
}
