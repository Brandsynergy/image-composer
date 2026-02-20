'use client';

import { useState } from 'react';
import { useAppStore, defaultScene, defaultOutput } from '@/lib/store';
import { buildPrompt } from '@/lib/prompt-engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SceneConfig, OutputConfig } from '@/types';
import {
  SETTINGS, POSES, OUTFITS, LIGHTING, CAMERA_ANGLES, CAMERA_DISTANCES,
  MOODS, TIMES_OF_DAY, BACKGROUNDS, ASPECT_RATIOS, VIRAL_PRESETS,
} from '@/lib/constants';
import {
  Camera, Sparkles, Wand2, Download, Heart, Users, Zap,
  Sun, MapPin, PersonStanding, Shirt, Aperture, Move3D,
  Palette, Clock, ImageIcon, RotateCcw, Copy,
} from 'lucide-react';

function OptionPicker({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
            value === opt
              ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
              : 'bg-white/[0.02] border-white/[0.04] text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function PhotoStudio() {
  const { models, settings, addImage, addImages, toggleFavorite, images } = useAppStore();
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');
  const [scene, setScene] = useState<SceneConfig>({ ...defaultScene });
  const [output, setOutput] = useState<OutputConfig>({ ...defaultOutput });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
  const [promptPreview, setPromptPreview] = useState('');
  const [error, setError] = useState('');

  const selectedModel = models.find((m) => m.id === selectedModelId);

  const updateScene = (updates: Partial<SceneConfig>) => setScene((p) => ({ ...p, ...updates }));

  const applyPreset = (preset: typeof VIRAL_PRESETS[0]) => {
    setScene((p) => ({ ...p, ...preset.scene }));
  };

  const handleGenerate = async () => {
    if (!selectedModel) { setError('Please select or create an AI model first.'); return; }
    if (!settings.replicateApiKey) { setError('Please set your Replicate API key in Settings.'); return; }

    setError('');
    setIsGenerating(true);

    const prompt = buildPrompt(selectedModel, scene);
    setPromptPreview(prompt);

    try {
      const results: string[] = [];
      for (let i = 0; i < output.count; i++) {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            aspectRatio: output.aspectRatio,
            quality: output.quality,
            apiKey: settings.replicateApiKey,
            seed: selectedModel.seed,
          }),
        });
        const data = await res.json();
        if (data.error) { setError(data.error); break; }
        const url = Array.isArray(data.output) ? data.output[0] : data.output;
        if (url) results.push(url);
      }

      if (results.length > 0) {
        setGeneratedUrls((prev) => [...results, ...prev]);
        addImages(results.map((url) => ({
          modelId: selectedModel.id,
          url,
          prompt,
          scene: { ...scene },
          output: { ...output },
          tags: [scene.mood, scene.setting].filter(Boolean),
          isFavorite: false,
        })));
      }
    } catch (err) {
      setError('Generation failed. Check your API key and try again.');
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">
      {/* Left Panel: Controls */}
      <div className="w-[380px] shrink-0">
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-5 pr-4">
            {/* Model Selector */}
            <div>
              <Label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">AI Model</Label>
              {models.length === 0 ? (
                <a href="/create" className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-white/10 text-sm text-zinc-400 hover:text-violet-400 hover:border-violet-500/30 transition-colors">
                  <Users className="h-4 w-4" /> Create your first model
                </a>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModelId(m.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        selectedModelId === m.id
                          ? 'bg-violet-600/20 border-violet-500/50 text-white'
                          : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 flex items-center justify-center overflow-hidden">
                        {m.thumbnail ? (
                          <img src={m.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="h-3 w-3 text-violet-400" />
                        )}
                      </div>
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* Viral Presets */}
            <div>
              <Label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Viral Presets
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {VIRAL_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-violet-600/10 hover:border-violet-500/20 transition-all text-left group"
                  >
                    <span className="text-[11px] font-medium text-white group-hover:text-violet-300 block">{preset.name}</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-white/[0.06]" />

            {/* Scene Controls */}
            <Tabs defaultValue="scene" className="w-full">
              <TabsList className="bg-white/[0.03] border border-white/[0.06] w-full">
                <TabsTrigger value="scene" className="text-xs flex-1 data-[state=active]:bg-violet-600/20 data-[state=active]:text-white">Scene</TabsTrigger>
                <TabsTrigger value="camera" className="text-xs flex-1 data-[state=active]:bg-violet-600/20 data-[state=active]:text-white">Camera</TabsTrigger>
                <TabsTrigger value="output" className="text-xs flex-1 data-[state=active]:bg-violet-600/20 data-[state=active]:text-white">Output</TabsTrigger>
              </TabsList>

              <TabsContent value="scene" className="space-y-4 mt-4">
                <FieldGroup label="Setting" icon={MapPin}>
                  <OptionPicker options={SETTINGS} value={scene.setting} onChange={(v) => updateScene({ setting: v })} />
                </FieldGroup>
                <FieldGroup label="Pose" icon={PersonStanding}>
                  <OptionPicker options={POSES} value={scene.pose} onChange={(v) => updateScene({ pose: v })} />
                </FieldGroup>
                <FieldGroup label="Outfit" icon={Shirt}>
                  <OptionPicker options={OUTFITS} value={scene.outfit} onChange={(v) => updateScene({ outfit: v })} />
                </FieldGroup>
                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">Outfit Details (optional)</Label>
                  <Input
                    value={scene.outfitDetails}
                    onChange={(e) => updateScene({ outfitDetails: e.target.value })}
                    placeholder="e.g. Gucci belt, gold watch, red heels..."
                    className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-600 h-8"
                  />
                </div>
                <FieldGroup label="Lighting" icon={Sun}>
                  <OptionPicker options={LIGHTING} value={scene.lighting} onChange={(v) => updateScene({ lighting: v })} />
                </FieldGroup>
                <FieldGroup label="Mood" icon={Palette}>
                  <OptionPicker options={MOODS} value={scene.mood} onChange={(v) => updateScene({ mood: v })} />
                </FieldGroup>
                <FieldGroup label="Time of Day" icon={Clock}>
                  <OptionPicker options={TIMES_OF_DAY} value={scene.timeOfDay} onChange={(v) => updateScene({ timeOfDay: v })} />
                </FieldGroup>
                <FieldGroup label="Background" icon={ImageIcon}>
                  <OptionPicker options={BACKGROUNDS} value={scene.background} onChange={(v) => updateScene({ background: v })} />
                </FieldGroup>
              </TabsContent>

              <TabsContent value="camera" className="space-y-4 mt-4">
                <FieldGroup label="Camera Angle" icon={Aperture}>
                  <OptionPicker options={CAMERA_ANGLES} value={scene.cameraAngle} onChange={(v) => updateScene({ cameraAngle: v })} />
                </FieldGroup>
                <FieldGroup label="Camera Distance" icon={Move3D}>
                  <OptionPicker options={CAMERA_DISTANCES} value={scene.cameraDistance} onChange={(v) => updateScene({ cameraDistance: v })} />
                </FieldGroup>
              </TabsContent>

              <TabsContent value="output" className="space-y-4 mt-4">
                <FieldGroup label="Aspect Ratio" icon={ImageIcon}>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.value}
                        onClick={() => setOutput((p) => ({ ...p, aspectRatio: ar.value }))}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          output.aspectRatio === ar.value
                            ? 'bg-violet-600/20 border-violet-500/50 text-white'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-[11px] font-medium block">{ar.label}</span>
                        <span className="text-[9px] text-zinc-500">{ar.description}</span>
                      </button>
                    ))}
                  </div>
                </FieldGroup>
                <FieldGroup label="Quality" icon={Sparkles}>
                  <div className="flex gap-2">
                    {(['standard', 'hd', 'ultra'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setOutput((p) => ({ ...p, quality: q }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                          output.quality === q
                            ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05]'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </FieldGroup>
                <FieldGroup label="Count" icon={Copy}>
                  <div className="flex gap-2">
                    {[1, 2, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setOutput((p) => ({ ...p, count: n }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          output.count === n
                            ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05]'
                        }`}
                      >
                        {n}x
                      </button>
                    ))}
                  </div>
                </FieldGroup>
              </TabsContent>
            </Tabs>

            {/* Custom Prompt */}
            <div>
              <Label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Custom Prompt Addition</Label>
              <Textarea
                value={scene.customPrompt}
                onChange={(e) => updateScene({ customPrompt: e.target.value })}
                placeholder="Add any custom details to enhance the generation..."
                className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-600 min-h-[60px] resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedModel}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white gap-2 h-11"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  Generate {output.count > 1 ? `${output.count} Photos` : 'Photo'}
                </>
              )}
            </Button>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">{error}</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel: Results */}
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Generated Photos</h2>
          {generatedUrls.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGeneratedUrls([])}
              className="text-zinc-400 hover:text-white gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>

        {/* Prompt Preview */}
        {promptPreview && (
          <div className="mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 block">Last Prompt</Label>
            <p className="text-[11px] text-zinc-400 font-mono leading-relaxed line-clamp-3">{promptPreview}</p>
          </div>
        )}

        {/* Results Grid */}
        {generatedUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {generatedUrls.map((url, i) => (
              <div key={`${url}-${i}`} className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-violet-500/30 transition-all bg-white/[0.02]">
                <div className="aspect-[4/5]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <a
                      href={url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white text-[11px] font-medium hover:bg-white/20 transition-colors"
                    >
                      <Download className="h-3 w-3" /> Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 flex items-center justify-center mb-4">
              <Camera className="h-8 w-8 text-violet-400/40" />
            </div>
            <h3 className="text-sm font-medium text-zinc-400 mb-1">No photos generated yet</h3>
            <p className="text-xs text-zinc-500 max-w-xs">Select a model, configure your scene, and hit Generate to create stunning AI photos.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldGroup({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </Label>
      {children}
    </div>
  );
}
