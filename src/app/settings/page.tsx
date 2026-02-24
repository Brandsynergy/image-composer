'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Key, Save, Trash2, Database, AlertTriangle, Check, ExternalLink } from 'lucide-react';
import { del, createStore } from 'idb-keyval';

export default function Settings() {
  const { settings, updateSettings, models, images } = useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  // Sync store value into local state during render (React 19 pattern)
  const [prevStoreKey, setPrevStoreKey] = useState('');
  if (settings.replicateApiKey !== prevStoreKey) {
    setPrevStoreKey(settings.replicateApiKey);
    setApiKey(settings.replicateApiKey);
  }

  const handleSave = () => {
    updateSettings({ replicateApiKey: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      const idbStore = createStore('image-composer-db', 'app-state');
      await del('image-composer-storage', idbStore);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-400">Configure your IMAGE COMPOSER Studio</p>
      </div>

      {/* API Key */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Replicate API Key</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Required for AI image generation. Get your API key from{' '}
            <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline inline-flex items-center gap-1">
              replicate.com <ExternalLink className="h-3 w-3" />
            </a>
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
            />
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shrink-0">
              {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save</>}
            </Button>
          </div>
          {settings.replicateApiKey && (
            <Badge variant="secondary" className="bg-green-600/10 text-green-400 text-[10px]">
              <Check className="h-3 w-3 mr-1" /> API key configured
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Data Management</h2>
          </div>
          <p className="text-xs text-zinc-400">
            All data is stored locally in your browser. No data is sent to external servers except for image generation via Replicate.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
              <p className="text-lg font-bold text-white">{models.length}</p>
              <p className="text-[10px] text-zinc-500">AI Models</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
              <p className="text-lg font-bold text-white">{images.length}</p>
              <p className="text-[10px] text-zinc-500">Generated Images</p>
            </div>
          </div>

          <Separator className="bg-white/[0.06]" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" /> Clear All Data
              </p>
              <p className="text-xs text-zinc-500">Permanently delete all models, images, and settings.</p>
            </div>
            <Button variant="ghost" onClick={handleClearData} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
              <Trash2 className="h-4 w-4" /> Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-6 space-y-2">
          <h2 className="text-sm font-semibold text-white">About IMAGE COMPOSER</h2>
          <p className="text-xs text-zinc-400">
            Professional AI model & influencer generation studio. Create hyper-realistic AI personas and generate
            stunning photo content for advertising, brands, and social media.
          </p>
          <p className="text-xs text-zinc-500">
            Powered by FLUX via Replicate. Built with Next.js, Tailwind CSS, and shadcn/ui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
