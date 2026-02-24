'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ServiceWorkerProvider } from '@/components/providers/sw-provider';
import { useAppStore } from '@/lib/store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { _hasHydrated, setHasHydrated } = useAppStore();
  const [timedOut, setTimedOut] = useState(false);

  // Fallback: if IndexedDB hydration takes too long, proceed anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAppStore.getState()._hasHydrated) {
        setHasHydrated(true);
        setTimedOut(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [setHasHydrated]);

  if (!_hasHydrated && !timedOut) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0b]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <span className="text-sm text-zinc-500">Loading IMAGE COMPOSER...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ServiceWorkerProvider />
      <TooltipProvider delayDuration={0}>
        <div className="flex min-h-screen bg-[#0a0a0b] text-white">
          <Sidebar />
          <main className="flex-1 transition-all duration-300 md:ml-[240px]">
            <div className="px-4 pt-[72px] pb-20 md:px-6 md:pt-6 md:pb-6">{children}</div>
          </main>
        </div>
      </TooltipProvider>
    </AuthProvider>
  );
}
