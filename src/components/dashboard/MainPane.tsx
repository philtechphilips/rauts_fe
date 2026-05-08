'use client';

import { useDashboard } from './DashboardContext';
import { CollectionOverview } from './overview/CollectionOverview';
import { FolderOverview } from './overview/FolderOverview';
import { EmptyOverview } from './overview/EmptyOverview';
import { EndpointEditor } from './editor/EndpointEditor';

export function MainPane() {
  const { selectedEp, selectedFolderView, selectedCol } = useDashboard();

  return (
    <main
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: '#1A1A1A' }}
    >
      {!selectedEp ? (
        <div className="flex-1 overflow-y-auto">
          {selectedFolderView ? (
            <FolderOverview />
          ) : selectedCol ? (
            <CollectionOverview />
          ) : (
            <EmptyOverview />
          )}
        </div>
      ) : (
        <EndpointEditor />
      )}
    </main>
  );
}
