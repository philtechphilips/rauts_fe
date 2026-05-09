'use client';

import { DashboardProvider } from '@/components/dashboard/DashboardContext';
import { useDashboardState } from '@/hooks/dashboard/useDashboardState';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { IconRail } from '@/components/dashboard/IconRail';
import { Sidebar } from '@/components/dashboard/sidebar/Sidebar';
import { MainPane } from '@/components/dashboard/MainPane';
import { StatusBar } from '@/components/dashboard/StatusBar';
import { LoadingOverlay } from '@/components/dashboard/LoadingOverlay';
import { ManualCreateModal } from '@/components/dashboard/modals/ManualCreateModal';
import { DeleteCollectionModal } from '@/components/dashboard/modals/DeleteCollectionModal';
import { SystemDialogModals } from '@/components/dashboard/modals/SystemDialogModals';
import { DashboardToast } from '@/components/dashboard/DashboardToast';

export default function DashboardPage() {
  const dashboard = useDashboardState();
  const { mobileSidebarOpen, setMobileSidebarOpen } = dashboard;

  return (
    <DashboardProvider value={dashboard}>
      <div
        className="h-[100dvh] min-h-0 flex flex-col overflow-hidden text-white relative"
        style={{ background: '#1A1A1A', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <LoadingOverlay />
        <TopHeader />
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {mobileSidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar"
              className="absolute inset-0 z-[45] bg-black/50 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
          )}
          <div
            className={`flex h-full shrink-0 transition-transform duration-200 ease-out md:relative md:z-[20] md:translate-x-0 z-[50] max-md:absolute max-md:top-0 max-md:bottom-0 max-md:left-0 max-md:shadow-[8px_0_40px_rgba(0,0,0,0.45)] ${
              mobileSidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
            }`}
          >
            <IconRail />
            <Sidebar />
          </div>
          <MainPane />
        </div>
        <StatusBar />
        <ManualCreateModal />
        <DeleteCollectionModal />
        <SystemDialogModals />
        <DashboardToast />
      </div>
    </DashboardProvider>
  );
}
