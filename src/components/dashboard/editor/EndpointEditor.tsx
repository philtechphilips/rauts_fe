'use client';

import { TabBar } from './TabBar';
import { RequestNameBar } from './RequestNameBar';
import { UrlBar } from './UrlBar';
import { RequestTabs } from './RequestTabs';
import { RequestPanel } from './RequestPanel';
import { ResponsePanel } from './ResponsePanel';

export function EndpointEditor() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TabBar />
      <RequestNameBar />
      <UrlBar />
      <RequestTabs />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <RequestPanel />
        <ResponsePanel />
      </div>
    </div>
  );
}
