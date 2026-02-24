'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  UserPlus, Camera, Image as ImageIcon, Sparkles, ArrowRight,
  Users, Heart, Clock, Coins, LogIn, CreditCard, Wand2, Download,
} from 'lucide-react';

export default function Dashboard() {
  const { models, images, settings } = useAppStore();
  const favoriteCount = images.filter((i) => i.isFavorite).length;
  const recentImages = images.slice(0, 8);
  const recentModels = models.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-transparent p-8">
        <div className="absolute right-0 top-0 h-64 w-64 bg-violet-500/10 blur-[100px]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icons/icon-192.png" alt="" className="h-6 w-6 rounded" />
            <span className="text-sm font-medium text-violet-400">IMAGE COMPOSER Studio</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Viral AI Models</h1>
          <p className="text-zinc-400 max-w-xl mb-6">
            Build hyper-realistic AI personas and generate stunning content that stops the scroll.
          </p>
          <div className="flex gap-3">
            <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Link href="/create"><UserPlus className="h-4 w-4" />Create New Model</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
              <Link href="/studio"><Camera className="h-4 w-4" />Open Studio</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">How It Works</h2>
        <p className="text-xs text-zinc-500 mb-5">From sign-up to download in 5 simple steps</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <StepCard step={1} icon={LogIn} title="Sign In" description="Create your account to get started and track your work." color="violet" />
          <StepCard step={2} icon={CreditCard} title="Buy Credits" description="Choose a credit pack. 50+ packs unlock PRO Enhance (4K + eye fix)." color="cyan" />
          <StepCard step={3} icon={UserPlus} title="Create a Model" description="Define your AI persona's face, body type, and style DNA step by step." color="fuchsia" />
          <StepCard step={4} icon={Camera} title="Generate Photos" description="Pick a model, set the scene, lighting, pose, and hit Generate. 1 credit per photo." color="violet" />
          <StepCard step={5} icon={Download} title="Download & Use" description="Browse your Gallery, favorite the best shots, and download in any format." color="green" />
        </div>

        {/* Key Details */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <h4 className="text-xs font-semibold text-white mb-1.5">Credit Pricing</h4>
            <ul className="space-y-1 text-[11px] text-zinc-400">
              <li className="flex justify-between"><span>20 credits</span><span className="text-white font-medium">$10.00</span></li>
              <li className="flex justify-between"><span>50 credits <span className="text-cyan-400">+ PRO Enhance</span></span><span className="text-white font-medium">$12.00</span></li>
              <li className="flex justify-between"><span>100 credits <span className="text-cyan-400">+ PRO Enhance</span></span><span className="text-white font-medium">$20.00</span></li>
            </ul>
            <p className="text-[9px] text-zinc-600 mt-2">Pay as you go. No subscriptions. No rollovers.</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <h4 className="text-xs font-semibold text-white mb-1.5">PRO Enhance</h4>
            <p className="text-[11px] text-zinc-400">Available on 50+ credit packs. Adds a second AI pass that fixes eyes, sharpens to 4K detail, and boosts fine textures.</p>
            <p className="text-[10px] text-zinc-500 mt-1.5">Uses <span className="text-white font-medium">2 credits</span> per enhanced image.</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
            <h4 className="text-xs font-semibold text-white mb-1.5">What You Can Create</h4>
            <p className="text-[11px] text-zinc-400">Hyper-realistic AI models for social media, advertising, brand content, and editorial. Full control over ethnicity, features, outfits, scenes, lighting, and poses.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="AI Models" value={models.length} icon={Users} color="violet" href="/create" />
        <StatCard title="Generated Photos" value={images.length} icon={ImageIcon} color="fuchsia" href="/gallery" />
        <StatCard title="Credits" value={settings.credits} icon={Coins} color="cyan" href="/pricing" />
        <StatCard title="Favorites" value={favoriteCount} icon={Heart} color="rose" href="/gallery" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionCard title="Create AI Model" description="Build a new persona from scratch with face, body, and style DNA" icon={UserPlus} href="/create" gradient="from-violet-600/20 to-violet-600/5" />
          <QuickActionCard title="Photo Studio" description="Generate stunning photos with full scene, lighting, and pose control" icon={Camera} href="/studio" gradient="from-fuchsia-600/20 to-fuchsia-600/5" />
        </div>
      </div>

      {/* Recent Models */}
      {recentModels.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your AI Models</h2>
            <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1">
              <Link href="/create">View All <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentModels.map((model) => (
              <Card key={model.id} className="bg-white/[0.02] border-white/[0.06] hover:border-violet-500/30 transition-colors group cursor-pointer">
                <CardContent className="p-4">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 mb-3 flex items-center justify-center overflow-hidden">
                    {model.thumbnail ? (
                      <img src={model.thumbnail} alt={model.name} className="w-full h-full object-cover rounded-lg" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <Users className="h-8 w-8 text-violet-400/50" />
                    )}
                  </div>
                  <h3 className="font-medium text-white text-sm truncate">{model.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-white/5 text-zinc-400 text-[10px]">{model.face.gender}</Badge>
                    <Badge variant="secondary" className="bg-white/5 text-zinc-400 text-[10px]">{model.face.ethnicity}</Badge>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />{new Date(model.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Generations */}
      {recentImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Generations</h2>
            <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1">
              <Link href="/gallery">View Gallery <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recentImages.map((image) => (
              <div key={image.id} className="group relative aspect-[4/5] rounded-lg overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 transition-all cursor-pointer">
                <img src={image.url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {models.length === 0 && images.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden mb-4">
            <img src="/icons/icon-192.png" alt="IMAGE COMPOSER" className="h-16 w-16 object-cover" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Welcome to IMAGE COMPOSER</h3>
          <p className="text-zinc-400 max-w-md mx-auto mb-6">Create your first AI model to start generating viral-ready content.</p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Link href="/create"><Sparkles className="h-4 w-4" />Create Your First AI Model</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, href }: { title: string; value: number; icon: React.ElementType; color: string; href: string }) {
  const colorMap: Record<string, string> = {
    violet: 'from-violet-600/20 to-violet-600/5 text-violet-400',
    fuchsia: 'from-fuchsia-600/20 to-fuchsia-600/5 text-fuchsia-400',
    cyan: 'from-cyan-600/20 to-cyan-600/5 text-cyan-400',
    rose: 'from-rose-600/20 to-rose-600/5 text-rose-400',
  };
  return (
    <Link href={href}>
      <Card className="bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-500">{title}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickActionCard({ title, description, icon: Icon, href, gradient }: { title: string; description: string; icon: React.ElementType; href: string; gradient: string }) {
  return (
    <Link href={href}>
      <Card className={`bg-gradient-to-br ${gradient} border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group h-full`}>
        <CardContent className="p-5">
          <Icon className="h-8 w-8 text-white/80 mb-3 group-hover:text-white transition-colors" />
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
          <div className="flex items-center gap-1 text-xs text-violet-400 mt-3 group-hover:gap-2 transition-all">Get Started <ArrowRight className="h-3 w-3" /></div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StepCard({ step, icon: Icon, title, description, color }: { step: number; icon: React.ElementType; title: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    violet: 'from-violet-600/20 to-violet-600/5 text-violet-400 border-violet-500/20',
    fuchsia: 'from-fuchsia-600/20 to-fuchsia-600/5 text-fuchsia-400 border-fuchsia-500/20',
    cyan: 'from-cyan-600/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
    green: 'from-green-600/20 to-green-600/5 text-green-400 border-green-500/20',
  };
  const classes = colorMap[color] || colorMap.violet;
  return (
    <div className={`relative rounded-xl bg-gradient-to-b ${classes.split(' ').slice(0, 2).join(' ')} border p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${classes.split(' ').slice(0, 2).join(' ')}`}>
          <Icon className={`h-3.5 w-3.5 ${classes.split(' ')[2]}`} />
        </div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase">Step {step}</span>
      </div>
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-[11px] text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}
