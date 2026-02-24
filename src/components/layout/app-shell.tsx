'use client';

import { Sidebar } from './sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Settings, Key, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [dismissed, setDismissed] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { settings, updateSettings, _hasHydrated } = useAppStore();

  // Derive dialog visibility — no useEffect needed
  const showApiDialog = _hasHydrated && !settings.replicateApiKey && !dismissed;

  const handleSaveApiKey = () => {
    updateSettings({ replicateApiKey: apiKey });
    setDismissed(true);
  };

  if (!_hasHydrated) {
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
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-[#0a0a0b] text-white">
        <Sidebar />
        <main className="ml-[240px] flex-1 transition-all duration-300">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0b]/80 px-6 backdrop-blur-xl">
            <div />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setApiKey(settings.replicateApiKey);
                  setDismissed(false);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <Key className="mr-2 h-4 w-4" />
                API Key
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white"
                asChild
              >
                <a href="/settings">
                  <Settings className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </header>
          <div className="p-6">{children}</div>
        </main>

        {/* API Key Dialog */}
        <Dialog open={showApiDialog} onOpenChange={(open) => { if (!open) setDismissed(true); }}>
          <DialogContent className="bg-[#141416] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-violet-400" />
                Replicate API Key
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Enter your Replicate API key to enable AI image generation.
                Get one at{' '}
                <a
                  href="https://replicate.com/account/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  replicate.com
                </a>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                type="password"
                placeholder="r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setDismissed(true)}
                  className="text-zinc-400"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Save Key
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
