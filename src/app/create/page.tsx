'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { buildPortraitPrompt } from '@/lib/prompt-engine';
import type { FaceConfig, BodyConfig, StyleConfig } from '@/types';
import {
  ETHNICITIES, AGES, GENDERS, SKIN_TONES, FACE_SHAPES, EYE_COLORS,
  EYE_SHAPES, HAIR_COLORS, HAIR_STYLES, HAIR_LENGTHS, FACIAL_FEATURES,
  EXPRESSIONS, BODY_TYPES, HEIGHTS, BUILDS, SKIN_TEXTURES,
  AESTHETICS, FASHION_STYLES, INFLUENCER_NICHES, VIBE_KEYWORDS, COLOR_PALETTES,
} from '@/lib/constants';
import {
  User, Shirt, Palette, Sparkles, ArrowRight, ArrowLeft,
  Check, Eye, Fingerprint, Scissors, Smile,
  Dumbbell, Ruler, Zap, Crown, Wand2,
} from 'lucide-react';

const steps = [
  { id: 'face', label: 'Face', icon: User, description: 'Define facial features' },
  { id: 'body', label: 'Body', icon: Dumbbell, description: 'Set body characteristics' },
  { id: 'style', label: 'Style', icon: Palette, description: 'Choose aesthetic & vibe' },
  { id: 'preview', label: 'Preview', icon: Sparkles, description: 'Review & generate' },
];

function OptionGrid({ options, value, onChange, multi = false, selected = [] }: {
  options: string[];
  value?: string;
  onChange: (val: string) => void;
  multi?: boolean;
  selected?: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = multi ? selected.includes(opt) : value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isSelected
                ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-300'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function CreateModel() {
  const router = useRouter();
  const { addModel, defaultFace, defaultBody, defaultStyle, settings } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [modelName, setModelName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [face, setFace] = useState<FaceConfig>({ ...defaultFace });
  const [body, setBody] = useState<BodyConfig>({ ...defaultBody });
  const [style, setStyle] = useState<StyleConfig>({ ...defaultStyle });

  const updateFace = (updates: Partial<FaceConfig>) => setFace((prev) => ({ ...prev, ...updates }));
  const updateBody = (updates: Partial<BodyConfig>) => setBody((prev) => ({ ...prev, ...updates }));
  const updateStyle = (updates: Partial<StyleConfig>) => setStyle((prev) => ({ ...prev, ...updates }));

  const toggleFeature = (feature: string) => {
    setFace((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const toggleVibeKeyword = (keyword: string) => {
    setStyle((prev) => ({
      ...prev,
      vibeKeywords: prev.vibeKeywords.includes(keyword)
        ? prev.vibeKeywords.filter((k) => k !== keyword)
        : [...prev.vibeKeywords, keyword],
    }));
  };

  const handleCreate = async () => {
    const name = modelName.trim() || `Model ${Date.now().toString(36).toUpperCase()}`;
    const tempModel = { name, face, body, style, referenceImages: [] as string[], thumbnail: undefined as string | undefined };
    const prompt = buildPortraitPrompt({ ...tempModel, id: '', createdAt: '', updatedAt: '' });

    // Try to generate a portrait thumbnail
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio: '1:1',
        }),
      });
      const data = await res.json();
      const imgUrl = data.output;
      if (imgUrl && typeof imgUrl === 'string' && (imgUrl.startsWith('http') || imgUrl.startsWith('data:'))) {
        tempModel.thumbnail = imgUrl;
        tempModel.referenceImages = [imgUrl];
      }
    } catch (err) {
      console.error('Generation failed:', err);
    }
    setIsGenerating(false);

    const model = addModel(tempModel);
    router.push('/studio');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create AI Model</h1>
        <p className="text-zinc-400 text-sm">Define every detail of your AI persona&apos;s DNA</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/20 text-white border border-violet-500/30'
                    : isCompleted
                    ? 'bg-white/[0.04] text-violet-400 border border-white/[0.06]'
                    : 'bg-white/[0.02] text-zinc-500 border border-white/[0.04]'
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-violet-400" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`h-px w-8 ${index < currentStep ? 'bg-violet-500/30' : 'bg-white/[0.06]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="bg-white/[0.02] border-white/[0.06]">
        <CardContent className="p-6">
          {/* Step 1: Face */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <SectionHeader icon={Fingerprint} title="Identity" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FieldGroup label="Gender">
                  <OptionGrid options={GENDERS} value={face.gender} onChange={(v) => updateFace({ gender: v })} />
                </FieldGroup>
                <FieldGroup label="Age Range">
                  <OptionGrid options={AGES} value={face.age} onChange={(v) => updateFace({ age: v })} />
                </FieldGroup>
                <FieldGroup label="Ethnicity">
                  <OptionGrid options={ETHNICITIES} value={face.ethnicity} onChange={(v) => updateFace({ ethnicity: v })} />
                </FieldGroup>
              </div>

              <Separator className="bg-white/[0.06]" />
              <SectionHeader icon={Eye} title="Face Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Skin Tone">
                  <OptionGrid options={SKIN_TONES} value={face.skinTone} onChange={(v) => updateFace({ skinTone: v })} />
                </FieldGroup>
                <FieldGroup label="Face Shape">
                  <OptionGrid options={FACE_SHAPES} value={face.faceShape} onChange={(v) => updateFace({ faceShape: v })} />
                </FieldGroup>
                <FieldGroup label="Eye Color">
                  <OptionGrid options={EYE_COLORS} value={face.eyeColor} onChange={(v) => updateFace({ eyeColor: v })} />
                </FieldGroup>
                <FieldGroup label="Eye Shape">
                  <OptionGrid options={EYE_SHAPES} value={face.eyeShape} onChange={(v) => updateFace({ eyeShape: v })} />
                </FieldGroup>
              </div>

              <Separator className="bg-white/[0.06]" />
              <SectionHeader icon={Scissors} title="Hair" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FieldGroup label="Hair Color">
                  <OptionGrid options={HAIR_COLORS} value={face.hairColor} onChange={(v) => updateFace({ hairColor: v })} />
                </FieldGroup>
                <FieldGroup label="Hair Style">
                  <OptionGrid options={HAIR_STYLES} value={face.hairStyle} onChange={(v) => updateFace({ hairStyle: v })} />
                </FieldGroup>
                <FieldGroup label="Hair Length">
                  <OptionGrid options={HAIR_LENGTHS} value={face.hairLength} onChange={(v) => updateFace({ hairLength: v })} />
                </FieldGroup>
              </div>

              <Separator className="bg-white/[0.06]" />
              <SectionHeader icon={Smile} title="Expression & Features" />
              <FieldGroup label="Expression">
                <OptionGrid options={EXPRESSIONS} value={face.expression} onChange={(v) => updateFace({ expression: v })} />
              </FieldGroup>
              <FieldGroup label="Distinguishing Features (select multiple)">
                <OptionGrid options={FACIAL_FEATURES} multi selected={face.features} onChange={toggleFeature} />
              </FieldGroup>
            </div>
          )}

          {/* Step 2: Body */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <SectionHeader icon={Dumbbell} title="Body Type" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Body Type">
                  <OptionGrid options={BODY_TYPES} value={body.bodyType} onChange={(v) => updateBody({ bodyType: v })} />
                </FieldGroup>
                <FieldGroup label="Build">
                  <OptionGrid options={BUILDS} value={body.build} onChange={(v) => updateBody({ build: v })} />
                </FieldGroup>
              </div>

              <Separator className="bg-white/[0.06]" />
              <SectionHeader icon={Ruler} title="Physical Attributes" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Height">
                  <OptionGrid options={HEIGHTS} value={body.height} onChange={(v) => updateBody({ height: v })} />
                </FieldGroup>
                <FieldGroup label="Skin Texture">
                  <OptionGrid options={SKIN_TEXTURES} value={body.skinTexture} onChange={(v) => updateBody({ skinTexture: v })} />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* Step 3: Style */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <SectionHeader icon={Crown} title="Aesthetic & Fashion" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="Aesthetic">
                  <OptionGrid options={AESTHETICS} value={style.aesthetic} onChange={(v) => updateStyle({ aesthetic: v })} />
                </FieldGroup>
                <FieldGroup label="Fashion Style">
                  <OptionGrid options={FASHION_STYLES} value={style.fashionStyle} onChange={(v) => updateStyle({ fashionStyle: v })} />
                </FieldGroup>
              </div>

              <Separator className="bg-white/[0.06]" />
              <SectionHeader icon={Zap} title="Influencer DNA" />
              <FieldGroup label="Influencer Niche">
                <OptionGrid options={INFLUENCER_NICHES} value={style.influencerNiche} onChange={(v) => updateStyle({ influencerNiche: v })} />
              </FieldGroup>
              <FieldGroup label="Vibe Keywords (select multiple)">
                <OptionGrid options={VIBE_KEYWORDS} multi selected={style.vibeKeywords} onChange={toggleVibeKeyword} />
              </FieldGroup>

              <Separator className="bg-white/[0.06]" />
              <FieldGroup label="Color Palette">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette.name}
                      onClick={() => updateStyle({ colorPalette: palette.colors })}
                      className={`p-3 rounded-lg border transition-all ${
                        JSON.stringify(style.colorPalette) === JSON.stringify(palette.colors)
                          ? 'border-violet-500/50 bg-violet-600/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        {palette.colors.map((color) => (
                          <div key={color} className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-400">{palette.name}</span>
                    </button>
                  ))}
                </div>
              </FieldGroup>
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <SectionHeader icon={Wand2} title="Model Preview" />

              <div className="mb-4">
                <Label className="text-zinc-300 text-sm mb-2 block">Model Name</Label>
                <Input
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. Luna, Kai, Aria..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-400 max-w-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Face Summary */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-violet-400" /> Face
                  </h3>
                  <div className="space-y-1 text-xs text-zinc-400">
                    <SummaryRow label="Gender" value={face.gender} />
                    <SummaryRow label="Age" value={face.age} />
                    <SummaryRow label="Ethnicity" value={face.ethnicity} />
                    <SummaryRow label="Skin" value={face.skinTone} />
                    <SummaryRow label="Face Shape" value={face.faceShape} />
                    <SummaryRow label="Eyes" value={`${face.eyeColor} ${face.eyeShape}`} />
                    <SummaryRow label="Hair" value={`${face.hairLength} ${face.hairStyle} ${face.hairColor}`} />
                    <SummaryRow label="Expression" value={face.expression} />
                    {face.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {face.features.map((f) => (
                          <Badge key={f} variant="secondary" className="bg-violet-600/10 text-violet-300 text-[10px]">{f}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Summary */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-fuchsia-400" /> Body
                  </h3>
                  <div className="space-y-1 text-xs text-zinc-400">
                    <SummaryRow label="Type" value={body.bodyType} />
                    <SummaryRow label="Build" value={body.build} />
                    <SummaryRow label="Height" value={body.height} />
                    <SummaryRow label="Skin" value={body.skinTexture} />
                  </div>
                </div>

                {/* Style Summary */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Palette className="h-4 w-4 text-cyan-400" /> Style
                  </h3>
                  <div className="space-y-1 text-xs text-zinc-400">
                    <SummaryRow label="Aesthetic" value={style.aesthetic} />
                    <SummaryRow label="Fashion" value={style.fashionStyle} />
                    <SummaryRow label="Niche" value={style.influencerNiche} />
                    <div className="flex gap-1 mt-2">
                      {style.colorPalette.map((c) => (
                        <div key={c} className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {style.vibeKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {style.vibeKeywords.map((k) => (
                          <Badge key={k} variant="secondary" className="bg-cyan-600/10 text-cyan-300 text-[10px]">{k}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Prompt Preview */}
              <div className="mt-6">
                <Label className="text-zinc-300 text-sm mb-2 block">Generated Prompt Preview</Label>
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 font-mono leading-relaxed max-h-32 overflow-y-auto">
                  {buildPortraitPrompt({ id: '', name: '', createdAt: '', updatedAt: '', face, body, style, referenceImages: [] })}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="text-zinc-400 hover:text-white gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white gap-2 min-w-[180px]"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating Portrait...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create Model
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-violet-400" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-zinc-500 uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300">{value}</span>
    </div>
  );
}
