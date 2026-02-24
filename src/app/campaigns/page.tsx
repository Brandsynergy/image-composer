'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { buildPrompt } from '@/lib/prompt-engine';
import { defaultScene } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Megaphone, Plus, Calendar, Image as ImageIcon, Users,
  ArrowRight, Trash2, Edit, Upload, Camera, Sparkles,
  Download, X, Package, Eye,
} from 'lucide-react';

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'LinkedIn', 'Pinterest', 'Facebook'];
const CAMPAIGN_MOODS = ['Aspirational', 'Bold', 'Elegant', 'Playful', 'Edgy', 'Warm', 'Corporate', 'Luxurious'];

export default function Campaigns() {
  const {
    campaigns, addCampaign, updateCampaign, deleteCampaign,
    models, images, settings, addImages, assignToCampaign,
  } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandColors, setBrandColors] = useState<string[]>(['#8B5CF6', '#EC4899', '#06B6D4']);
  const [mood, setMood] = useState('Aspirational');
  const [platforms, setPlatforms] = useState<string[]>(['Instagram']);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [contentBrief, setContentBrief] = useState('');

  const resetForm = () => {
    setName(''); setDescription(''); setBrandName(''); setBrandColors(['#8B5CF6', '#EC4899', '#06B6D4']);
    setMood('Aspirational'); setPlatforms(['Instagram']); setSelectedModels([]); setContentBrief('');
    setEditId(null);
  };

  const handleCreate = () => {
    addCampaign({
      name: name || 'Untitled Campaign',
      description, brandName, brandColors, mood,
      targetPlatforms: platforms,
      modelIds: selectedModels,
      imageIds: [],
      productImages: [],
      status: 'draft',
      contentBrief,
    });
    resetForm();
    setShowCreate(false);
  };

  const handleEdit = (id: string) => {
    const c = campaigns.find((c) => c.id === id);
    if (!c) return;
    setName(c.name); setDescription(c.description); setBrandName(c.brandName);
    setBrandColors(c.brandColors); setMood(c.mood); setPlatforms(c.targetPlatforms);
    setSelectedModels(c.modelIds); setContentBrief(c.contentBrief); setEditId(id);
    setShowCreate(true);
  };

  const handleSaveEdit = () => {
    if (!editId) return;
    updateCampaign(editId, {
      name, description, brandName, brandColors, mood,
      targetPlatforms: platforms, modelIds: selectedModels, contentBrief,
    });
    resetForm();
    setShowCreate(false);
  };

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const toggleModel = (id: string) => {
    setSelectedModels((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  // ── Product Upload ──────────────────────────────────────────
  const handleProductUpload = (campaignId: string, files: FileList | null) => {
    if (!files) return;
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const current = campaigns.find((c) => c.id === campaignId);
        const existing = current?.productImages || [];
        updateCampaign(campaignId, { productImages: [...existing, dataUrl] });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeProductImage = (campaignId: string, index: number) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    const updated = [...(campaign.productImages || [])];
    updated.splice(index, 1);
    updateCampaign(campaignId, { productImages: updated });
  };

  // ── Generate Campaign Content ───────────────────────────────
  const handleGenerate = async (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;
    if (!settings.replicateApiKey) { setGenError('Set your Replicate API key in Settings.'); return; }

    const model = models.find((m) => campaign.modelIds.includes(m.id)) || models[0];
    if (!model) { setGenError('No AI models available. Create one first.'); return; }

    setGenError('');
    setIsGenerating(true);

    try {
      const scene = {
        ...defaultScene,
        mood: campaign.mood || 'Empowering',
        lighting: 'Natural Daylight',
        pose: 'Facing Camera Directly',
        cameraDistance: 'Medium Shot (Waist)',
        customPrompt: [
          campaign.contentBrief,
          campaign.brandName ? `for ${campaign.brandName} brand campaign` : '',
          (campaign.productImages || []).length > 0 ? 'holding/showcasing a branded product' : '',
        ].filter(Boolean).join('. '),
      };

      const prompt = buildPrompt(model, scene);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio: '4:5',
          apiKey: settings.replicateApiKey,
          seed: model.seed,
          model: 'flux-kontext-pro',
          outputFormat: 'png',
          outputQuality: 95,
          enhance: true,
        }),
      });

      const data = await res.json();
      if (data.error) { setGenError(data.error); setIsGenerating(false); return; }

      const url = typeof data.output === 'string' ? data.output : null;
      if (url && (url.startsWith('http') || url.startsWith('data:'))) {
        addImages([{
          modelId: model.id,
          url,
          prompt,
          scene,
          output: { aspectRatio: '4:5', quality: 'hd', count: 1, format: 'png' },
          tags: [campaign.mood, campaign.brandName].filter(Boolean),
          isFavorite: false,
          campaignId,
        }]);
      } else {
        setGenError('Unexpected response from generation API.');
      }
    } catch (err) {
      setGenError(`Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setIsGenerating(false);
  };

  // ── Detail View Helpers ─────────────────────────────────────
  const detailCampaign = campaigns.find((c) => c.id === detailId);
  const detailImages = detailCampaign
    ? images.filter((i) => i.campaignId === detailCampaign.id || detailCampaign.imageIds.includes(i.id))
    : [];
  const detailModels = detailCampaign
    ? models.filter((m) => detailCampaign.modelIds.includes(m.id))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-sm text-zinc-400">Create branded content series for advertising</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreate(true); }} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const campaignImages = images.filter((i) => i.campaignId === campaign.id || campaign.imageIds.includes(i.id));
            const campaignModels = models.filter((m) => campaign.modelIds.includes(m.id));
            return (
              <Card key={campaign.id} className="bg-white/[0.02] border-white/[0.06] hover:border-violet-500/20 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{campaign.name}</h3>
                      {campaign.brandName && <p className="text-xs text-zinc-500 mt-0.5">{campaign.brandName}</p>}
                    </div>
                    <Badge variant="secondary" className={`text-[10px] ${campaign.status === 'active' ? 'bg-green-600/10 text-green-400' : campaign.status === 'completed' ? 'bg-blue-600/10 text-blue-400' : 'bg-yellow-600/10 text-yellow-400'}`}>
                      {campaign.status}
                    </Badge>
                  </div>

                  {campaign.description && <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{campaign.description}</p>}

                  <div className="flex gap-1 mb-3">
                    {campaign.brandColors.map((c) => (
                      <div key={c} className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    ))}
                    <span className="text-[10px] text-zinc-500 ml-1">{campaign.mood}</span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-zinc-500 mb-3">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {campaignModels.length} models</span>
                    <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {campaignImages.length} photos</span>
                    {(campaign.productImages || []).length > 0 && (
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {campaign.productImages.length} products</span>
                    )}
                  </div>

                  {campaignImages.length > 0 && (
                    <div className="flex gap-1 mb-3">
                      {campaignImages.slice(0, 4).map((img) => (
                        <div key={img.id} className="h-12 w-12 rounded-md overflow-hidden bg-white/5">
                          <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                      ))}
                      {campaignImages.length > 4 && (
                        <div className="h-12 w-12 rounded-md bg-white/5 flex items-center justify-center text-[10px] text-zinc-500">+{campaignImages.length - 4}</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                    <Button variant="ghost" size="sm" onClick={() => setDetailId(campaign.id)} className="text-violet-400 hover:text-white text-xs gap-1 h-7 px-2">
                      <Eye className="h-3 w-3" /> Open
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(campaign.id)} className="text-zinc-400 hover:text-white text-xs gap-1 h-7 px-2">
                      <Edit className="h-3 w-3" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => updateCampaign(campaign.id, { status: campaign.status === 'draft' ? 'active' : campaign.status === 'active' ? 'completed' : 'draft' })} className="text-zinc-400 hover:text-white text-xs gap-1 h-7 px-2">
                      <ArrowRight className="h-3 w-3" /> {campaign.status === 'draft' ? 'Activate' : campaign.status === 'active' ? 'Complete' : 'Reopen'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (window.confirm('Delete this campaign?')) deleteCampaign(campaign.id); }} className="text-zinc-400 hover:text-red-400 text-xs gap-1 h-7 px-2 ml-auto">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <p className="text-[10px] text-zinc-600 mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 flex items-center justify-center mb-4">
            <Megaphone className="h-8 w-8 text-violet-400/40" />
          </div>
          <h3 className="text-sm font-medium text-zinc-400 mb-1">No campaigns yet</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-4">Create campaigns to organize branded content with consistent AI models and brand guidelines.</p>
          <Button onClick={() => setShowCreate(true)} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="h-4 w-4" /> Create First Campaign
          </Button>
        </div>
      )}

      {/* ── Campaign Detail Dialog ──────────────────────────────── */}
      <Dialog open={!!detailId} onOpenChange={(open) => { if (!open) { setDetailId(null); setGenError(''); } }}>
        <DialogContent className="bg-[#0e0e10] border-white/10 text-white sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          {detailCampaign && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Detail Header */}
              <div className="p-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{detailCampaign.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      {detailCampaign.brandName && <span className="text-xs text-zinc-400">{detailCampaign.brandName}</span>}
                      <Badge variant="secondary" className={`text-[10px] ${detailCampaign.status === 'active' ? 'bg-green-600/10 text-green-400' : detailCampaign.status === 'completed' ? 'bg-blue-600/10 text-blue-400' : 'bg-yellow-600/10 text-yellow-400'}`}>
                        {detailCampaign.status}
                      </Badge>
                      <span className="text-[10px] text-zinc-500">{detailCampaign.mood}</span>
                    </div>
                    {detailCampaign.contentBrief && <p className="text-xs text-zinc-500 mt-2 max-w-xl">{detailCampaign.contentBrief}</p>}
                  </div>
                  {detailModels.length > 0 && (
                    <div className="flex -space-x-2">
                      {detailModels.slice(0, 3).map((m) => (
                        <div key={m.id} className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border-2 border-[#0e0e10] flex items-center justify-center overflow-hidden" title={m.name}>
                          {m.thumbnail ? <img src={m.thumbnail} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <Users className="h-3 w-3 text-violet-400" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Product Images Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Package className="h-4 w-4 text-violet-400" /> Product Images
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-violet-400 hover:text-white text-xs gap-1 h-7">
                        <Upload className="h-3 w-3" /> Upload
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleProductUpload(detailCampaign.id, e.target.files); e.target.value = ''; }} />
                    </div>

                    {(detailCampaign.productImages || []).length > 0 ? (
                      <div className="flex gap-3 flex-wrap">
                        {detailCampaign.productImages.map((img, i) => (
                          <div key={i} className="relative group/prod">
                            <div className="h-24 w-24 rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.02]">
                              <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <button onClick={() => removeProductImage(detailCampaign.id, i)} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover/prod:opacity-100 transition-opacity">
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => fileInputRef.current?.click()} className="h-24 w-24 rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-500 hover:text-violet-400 hover:border-violet-500/30 transition-colors">
                          <Plus className="h-5 w-5" />
                          <span className="text-[9px] mt-1">Add More</span>
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()} className="w-full p-6 rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-500 hover:text-violet-400 hover:border-violet-500/30 transition-colors">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium">Upload product images</span>
                        <span className="text-[10px] mt-0.5">PNG, JPG up to 10MB</span>
                      </button>
                    )}
                  </div>

                  <Separator className="bg-white/[0.06]" />

                  {/* Generate Button */}
                  <div>
                    <Button
                      onClick={() => handleGenerate(detailCampaign.id)}
                      disabled={isGenerating || detailModels.length === 0}
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white gap-2 h-11"
                    >
                      {isGenerating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Generating Campaign Content...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Campaign Photo
                        </>
                      )}
                    </Button>
                    {detailModels.length === 0 && (
                      <p className="text-[10px] text-yellow-400 mt-2">Assign at least one AI model to this campaign to generate photos.</p>
                    )}
                    {genError && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20 mt-2">{genError}</p>}
                  </div>

                  <Separator className="bg-white/[0.06]" />

                  {/* Campaign Output Gallery */}
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                      <Camera className="h-4 w-4 text-violet-400" /> Campaign Output
                      <span className="text-[10px] text-zinc-500 font-normal ml-1">{detailImages.length} photos</span>
                    </h3>

                    {detailImages.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {detailImages.map((img) => (
                          <div key={img.id} className="rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.02]">
                            <div className="aspect-[4/5]">
                              <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                            <div className="flex items-center justify-between px-2.5 py-2 border-t border-white/[0.04]">
                              <a href={img.url} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-violet-600/20 text-violet-300 text-[10px] font-medium hover:bg-violet-600/30 transition-colors">
                                <Download className="h-3 w-3" /> Save
                              </a>
                              <span className="text-[9px] text-zinc-600">{new Date(img.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 flex items-center justify-center mb-3">
                          <ImageIcon className="h-6 w-6 text-violet-400/40" />
                        </div>
                        <p className="text-xs text-zinc-500">No photos yet. Click Generate to create campaign content.</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create/Edit Dialog ──────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { resetForm(); } setShowCreate(open); }}>
        <DialogContent className="bg-[#141416] border-white/10 text-white sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Define your brand campaign with target platforms and visual guidelines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-zinc-400 mb-1 block">Campaign Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Collection 2025" className="bg-white/5 border-white/10 text-white text-sm placeholder:text-zinc-600" />
              </div>
              <div>
                <Label className="text-xs text-zinc-400 mb-1 block">Brand Name</Label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Nike, Chanel..." className="bg-white/5 border-white/10 text-white text-sm placeholder:text-zinc-600" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-zinc-400 mb-1 block">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Campaign goals and vision..." className="bg-white/5 border-white/10 text-white text-sm placeholder:text-zinc-600 min-h-[60px] resize-none" />
            </div>

            <div>
              <Label className="text-xs text-zinc-400 mb-1 block">Content Brief</Label>
              <Textarea value={contentBrief} onChange={(e) => setContentBrief(e.target.value)} placeholder="Describe the content you need: types of shots, key messages, visual style..." className="bg-white/5 border-white/10 text-white text-sm placeholder:text-zinc-600 min-h-[60px] resize-none" />
            </div>

            <div>
              <Label className="text-xs text-zinc-400 mb-2 block">Campaign Mood</Label>
              <div className="flex flex-wrap gap-1.5">
                {CAMPAIGN_MOODS.map((m) => (
                  <button key={m} onClick={() => setMood(m)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${mood === m ? 'bg-violet-600/20 border-violet-500/50 text-violet-300' : 'bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:text-zinc-300'}`}>{m}</button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-zinc-400 mb-2 block">Target Platforms</Label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map((p) => (
                  <button key={p} onClick={() => togglePlatform(p)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${platforms.includes(p) ? 'bg-violet-600/20 border-violet-500/50 text-violet-300' : 'bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:text-zinc-300'}`}>{p}</button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-zinc-400 mb-2 block">Brand Colors</Label>
              <div className="flex items-center gap-2">
                {brandColors.map((c, i) => (
                  <div key={i} className="relative">
                    <input type="color" value={c} onChange={(e) => { const nc = [...brandColors]; nc[i] = e.target.value; setBrandColors(nc); }} className="h-8 w-8 rounded-full cursor-pointer border-2 border-white/10" />
                  </div>
                ))}
                {brandColors.length < 5 && (
                  <button onClick={() => setBrandColors([...brandColors, '#666666'])} className="h-8 w-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-zinc-500 hover:text-zinc-300">
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {models.length > 0 && (
              <div>
                <Label className="text-xs text-zinc-400 mb-2 block">Assign AI Models</Label>
                <div className="flex flex-wrap gap-2">
                  {models.map((m) => (
                    <button key={m.id} onClick={() => toggleModel(m.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedModels.includes(m.id) ? 'bg-violet-600/20 border-violet-500/50 text-white' : 'bg-white/[0.03] border-white/[0.06] text-zinc-500'}`}>
                      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 overflow-hidden">
                        {m.thumbnail ? <img src={m.thumbnail} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <Users className="h-3 w-3 text-violet-400 m-auto mt-1" />}
                      </div>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => { resetForm(); setShowCreate(false); }} className="text-zinc-400">Cancel</Button>
              <Button onClick={editId ? handleSaveEdit : handleCreate} className="bg-violet-600 hover:bg-violet-700 text-white">
                {editId ? 'Save Changes' : 'Create Campaign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
