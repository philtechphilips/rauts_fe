'use client';

import React, { createContext, useContext } from 'react';
import { useDashboardState } from '@/hooks/dashboard/useDashboardState';

type DashboardContextValue = ReturnType<typeof useDashboardState>;

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  value,
  children,
}: {
  value: DashboardContextValue;
  children: React.ReactNode;
}) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside <DashboardProvider>');
  return ctx;
}
