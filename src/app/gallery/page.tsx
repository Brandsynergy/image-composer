'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EXPORT_PRESETS } from '@/lib/constants';
import {
  Heart, Download, Trash2, Search, Filter, Grid3X3,
  LayoutGrid, X, ExternalLink, Tag, Calendar, Camera,
  Image as ImageIcon, SlidersHorizontal,
} from 'lucide-react';

export default function Gallery() {
  const { images, models, toggleFavorite, deleteImage } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'favorites' | string>('all');
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState<'sm' | 'lg'>('lg');

  const filteredImages = images.filter((img) => {
    if (filter === 'favorites' && !img.isFavorite) return false;
    if (filter !== 'all' && filter !== 'favorites' && img.modelId !== filter) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        img.prompt.toLowerCase().includes(searchLower) ||
        img.tags.some((t) => t.toLowerCase().includes(searchLower)) ||
        img.scene.setting.toLowerCase().includes(searchLower) ||
        img.scene.mood.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const selectedImg = images.find((i) => i.id === selectedImage);
  const selectedModelName = selectedImg ? models.find((m) => m.id === selectedImg.modelId)?.name : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery</h1>
          <p className="text-sm text-zinc-400">{images.length} photos generated</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by prompt, tag, setting..."
            className="pl-9 bg-white/[0.03] border-white/[0.06] text-white text-sm placeholder:text-zinc-600 h-9"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
          <FilterButton active={filter === 'favorites'} onClick={() => setFilter('favorites')}>
            <Heart className="h-3 w-3" /> Favorites
          </FilterButton>
          {models.map((m) => (
            <FilterButton key={m.id} active={filter === m.id} onClick={() => setFilter(m.id)}>
              {m.name}
            </FilterButton>
          ))}
        </div>

        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setGridSize('lg')}
            className={`p-1.5 rounded ${gridSize === 'lg' ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setGridSize('sm')}
            className={`p-1.5 rounded ${gridSize === 'sm' ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image Grid */}
      {filteredImages.length > 0 ? (
        <div className={`grid gap-3 ${gridSize === 'lg' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group rounded-xl overflow-hidden border border-white/[0.06] hover:border-violet-500/30 transition-all bg-white/[0.02]"
            >
              {/* Image — click to open lightbox */}
              <div className="relative cursor-pointer" onClick={() => setSelectedImage(image.id)}>
                <div className="aspect-[4/5]">
                  <img src={image.url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
                </div>
                {image.isFavorite && (
                  <div className="absolute top-2 right-2">
                    <Heart className="h-4 w-4 text-rose-400 fill-rose-400 drop-shadow" />
                  </div>
                )}
              </div>

              {/* Action bar — always visible */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-white/[0.02] border-t border-white/[0.04]">
                <button
                  onClick={() => toggleFavorite(image.id)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                  title={image.isFavorite ? 'Unfavorite' : 'Favorite'}
                >
                  <Heart className={`h-4 w-4 ${image.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-zinc-500 hover:text-rose-400'}`} />
                </button>
                <div className="flex items-center gap-1">
                  <a
                    href={image.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-[11px] font-medium hover:bg-violet-600/30 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Save
                  </a>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this image?')) deleteImage(image.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-violet-400/40" />
          </div>
          <h3 className="text-sm font-medium text-zinc-400 mb-1">
            {search || filter !== 'all' ? 'No matching images' : 'No images yet'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs">
            {search || filter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Head to the Photo Studio to generate your first images.'}
          </p>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="bg-[#0e0e10] border-white/10 text-white max-w-4xl p-0 overflow-hidden">
          {selectedImg && (
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="flex-1 bg-black flex items-center justify-center min-h-[400px]">
                <img src={selectedImg.url} alt="" className="max-h-[70vh] w-auto object-contain" />
              </div>

              {/* Details Sidebar */}
              <div className="w-full md:w-80 p-5 space-y-4 border-l border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Image Details</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(selectedImg.id)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${selectedImg.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-zinc-400'}`} />
                    </button>
                    <a
                      href={selectedImg.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Download className="h-4 w-4 text-zinc-400" />
                    </a>
                    <button
                      onClick={() => { deleteImage(selectedImg.id); setSelectedImage(null); }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {selectedModelName && (
                    <DetailRow icon={Camera} label="Model" value={selectedModelName} />
                  )}
                  <DetailRow icon={Calendar} label="Created" value={new Date(selectedImg.createdAt).toLocaleString()} />
                  <DetailRow icon={SlidersHorizontal} label="Setting" value={selectedImg.scene.setting} />
                  <DetailRow icon={SlidersHorizontal} label="Mood" value={selectedImg.scene.mood} />
                  <DetailRow icon={SlidersHorizontal} label="Lighting" value={selectedImg.scene.lighting} />
                  <DetailRow icon={SlidersHorizontal} label="Pose" value={selectedImg.scene.pose} />

                  {selectedImg.tags.length > 0 && (
                    <div>
                      <span className="text-zinc-500 flex items-center gap-1 mb-1"><Tag className="h-3 w-3" /> Tags</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedImg.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="bg-white/5 text-zinc-400 text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Export Options */}
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Export As</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EXPORT_PRESETS.slice(0, 6).map((preset) => (
                      <a
                        key={preset.name}
                        href={selectedImg.url}
                        download={`${selectedModelName || 'model'}-${preset.platform}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-violet-600/10 hover:border-violet-500/20 transition-all"
                      >
                        <span className="text-sm">{preset.icon}</span>
                        <div>
                          <span className="text-[10px] font-medium text-zinc-300 block">{preset.name}</span>
                          <span className="text-[9px] text-zinc-500">{preset.width}x{preset.height}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
        active
          ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
          : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300'
      }`}
    >
      {children}
    </button>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-zinc-500 flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</span>
      <span className="text-zinc-300 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
