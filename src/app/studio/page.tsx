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
  Palette, Clock, ImageIcon, RotateCcw, Copy, Trash2,
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
  const { models, settings, addImage, addImages, toggleFavorite, images, _hasHydrated } = useAppStore();
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');
  const [scene, setScene] = useState<SceneConfig>({ ...defaultScene });
  const [output, setOutput] = useState<OutputConfig>({ ...defaultOutput });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
  const [promptPreview, setPromptPreview] = useState('');
  const [error, setError] = useState('');

  // Engine & quality controls
  const [engine, setEngine] = useState<'flux-kontext-pro' | 'flux-2-pro' | 'flux-2-flex' | 'flux-1.1-pro-ultra' | 'flux-schnell'>('flux-kontext-pro');
  const [promptUpsampling, setPromptUpsampling] = useState(true);
  const [rawMode, setRawMode] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [outputQuality, setOutputQuality] = useState(95);
  const [flexSteps, setFlexSteps] = useState(28);
  const [flexGuidance, setFlexGuidance] = useState(3.5);
  const [enhance, setEnhance] = useState(true);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  const updateScene = (updates: Partial<SceneConfig>) => setScene((p) => ({ ...p, ...updates }));

  const applyPreset = (preset: typeof VIRAL_PRESETS[0]) => {
    setScene((p) => ({ ...p, ...preset.scene }));
  };

  const handleGenerate = async () => {
    if (!selectedModel) { setError('Please select or create an AI model first.'); return; }
    if (!_hasHydrated) { setError('Loading saved settings… please try again.'); return; }
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
            apiKey: settings.replicateApiKey,
            seed: selectedModel.seed,
            model: engine,
            outputFormat,
            outputQuality,
            enhance,
            ...(engine === 'flux-2-pro' ? { promptUpsampling } : {}),
            ...(engine === 'flux-1.1-pro-ultra' ? { raw: rawMode } : {}),
            ...(engine === 'flux-2-flex' ? { steps: flexSteps, guidance: flexGuidance } : {}),
          }),
        });
        const data = await res.json();
        if (data.error) { setError(data.error); break; }
        // API now always returns { output: "https://..." } as a plain string
        const url = typeof data.output === 'string' ? data.output : (Array.isArray(data.output) ? data.output[0] : null);
        if (url && typeof url === 'string' && (url.startsWith('http') || url.startsWith('data:'))) {
          results.push(url);
        } else {
          setError(`Unexpected response format. Got: ${JSON.stringify(data).slice(0, 200)}`);
          break;
        }
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
      setError(`Generation failed: ${err instanceof Error ? err.message : 'Check your API key and try again.'}`);
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
                {/* AI Engine Selector */}
                <FieldGroup label="AI Engine" icon={Wand2}>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: 'flux-kontext-pro' as const, name: 'Kontext Pro', desc: 'Best sharpness' },
                      { id: 'flux-2-pro' as const, name: 'FLUX 2 Pro', desc: 'Best quality' },
                      { id: 'flux-2-flex' as const, name: 'FLUX 2 Flex', desc: 'Fast + tunable' },
                      { id: 'flux-1.1-pro-ultra' as const, name: 'FLUX Ultra', desc: '4MP RAW mode' },
                      { id: 'flux-schnell' as const, name: 'FLUX Schnell', desc: 'Fastest / free' },
                    ]).map((eng) => (
                      <button
                        key={eng.id}
                        onClick={() => setEngine(eng.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          engine === eng.id
                            ? 'bg-violet-600/20 border-violet-500/50 text-white'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-[11px] font-medium block">{eng.name}</span>
                        <span className="text-[9px] text-zinc-500">{eng.desc}</span>
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                {/* Prompt Upsampling (FLUX 2 Pro only) */}
                {engine === 'flux-2-pro' && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <span className="text-[11px] font-medium text-white block">Prompt Upsampling</span>
                      <span className="text-[9px] text-zinc-500">AI enhances your prompt for better results</span>
                    </div>
                    <button
                      onClick={() => setPromptUpsampling(!promptUpsampling)}
                      className={`w-9 h-5 rounded-full transition-colors ${
                        promptUpsampling ? 'bg-violet-600' : 'bg-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${
                        promptUpsampling ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                )}

                {/* RAW Mode (FLUX Ultra only) */}
                {engine === 'flux-1.1-pro-ultra' && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <span className="text-[11px] font-medium text-white block">RAW Mode</span>
                      <span className="text-[9px] text-zinc-500">Less AI post-processing, more natural</span>
                    </div>
                    <button
                      onClick={() => setRawMode(!rawMode)}
                      className={`w-9 h-5 rounded-full transition-colors ${
                        rawMode ? 'bg-violet-600' : 'bg-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${
                        rawMode ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                )}

                {/* Steps & Guidance (FLUX 2 Flex only) */}
                {engine === 'flux-2-flex' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label className="text-[10px] text-zinc-500">Steps: {flexSteps}</Label>
                      </div>
                      <input
                        type="range" min={10} max={50} value={flexSteps}
                        onChange={(e) => setFlexSteps(Number(e.target.value))}
                        className="w-full accent-violet-600 h-1"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label className="text-[10px] text-zinc-500">Guidance: {flexGuidance}</Label>
                      </div>
                      <input
                        type="range" min={1} max={10} step={0.5} value={flexGuidance}
                        onChange={(e) => setFlexGuidance(Number(e.target.value))}
                        className="w-full accent-violet-600 h-1"
                      />
                    </div>
                  </div>
                )}

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

                {/* Output Format */}
                <FieldGroup label="Format" icon={Aperture}>
                  <div className="flex gap-2">
                    {(['png', 'jpg', 'webp'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setOutputFormat(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all uppercase ${
                          outputFormat === f
                            ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                {/* Quality Slider */}
                {outputFormat !== 'png' && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label className="text-[10px] text-zinc-500">Compression Quality: {outputQuality}%</Label>
                    </div>
                    <input
                      type="range" min={50} max={100} value={outputQuality}
                      onChange={(e) => setOutputQuality(Number(e.target.value))}
                      className="w-full accent-violet-600 h-1"
                    />
                  </div>
                )}

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

                {/* Premium Enhancement */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-white block">PRO Enhance</span>
                      <span className="text-[9px] text-zinc-500">4K · Eye Fix · Detail Boost</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEnhance(!enhance)}
                    className={`w-10 h-[22px] rounded-full transition-colors ${
                      enhance ? 'bg-fuchsia-600' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`w-[18px] h-[18px] rounded-full bg-white transition-transform mx-0.5 ${
                      enhance ? 'translate-x-[18px]' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </TabsContent>
            </Tabs>

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

        {/* Results Grid */}
        {generatedUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {generatedUrls.map((url, i) => (
              <div key={`${url}-${i}`} className="rounded-xl overflow-hidden border border-white/[0.06] hover:border-violet-500/30 transition-all bg-white/[0.02]">
                <div className="aspect-[4/5]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 border-t border-white/[0.04]">
                  <a
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-[11px] font-medium hover:bg-violet-600/30 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                  <button
                    onClick={() => setGeneratedUrls((prev) => prev.filter((_, idx) => idx !== i))}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                  </button>
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
