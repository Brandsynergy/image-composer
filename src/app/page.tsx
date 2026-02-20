'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  UserPlus, Camera, Image as ImageIcon, Megaphone, Sparkles, ArrowRight,
  Users, Heart, Clock,
} from 'lucide-react';

export default function Dashboard() {
  const { models, images, campaigns } = useAppStore();
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
            <Sparkles className="h-5 w-5 text-violet-400" />
            <span className="text-sm font-medium text-violet-400">IMAGE COMPOSER Studio</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Viral AI Models</h1>
          <p className="text-zinc-400 max-w-xl mb-6">
            Build hyper-realistic AI personas, generate stunning content, and launch campaigns that stop the scroll.
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="AI Models" value={models.length} icon={Users} color="violet" href="/create" />
        <StatCard title="Generated Photos" value={images.length} icon={ImageIcon} color="fuchsia" href="/gallery" />
        <StatCard title="Campaigns" value={campaigns.length} icon={Megaphone} color="cyan" href="/campaigns" />
        <StatCard title="Favorites" value={favoriteCount} icon={Heart} color="rose" href="/gallery" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard title="Create AI Model" description="Build a new persona from scratch with face, body, and style DNA" icon={UserPlus} href="/create" gradient="from-violet-600/20 to-violet-600/5" />
          <QuickActionCard title="Photo Studio" description="Generate stunning photos with full scene, lighting, and pose control" icon={Camera} href="/studio" gradient="from-fuchsia-600/20 to-fuchsia-600/5" />
          <QuickActionCard title="Launch Campaign" description="Create branded content series for advertising and social media" icon={Megaphone} href="/campaigns" gradient="from-cyan-600/20 to-cyan-600/5" />
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
                      <img src={model.thumbnail} alt={model.name} className="w-full h-full object-cover rounded-lg" />
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
                <img src={image.url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {models.length === 0 && images.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-violet-400" />
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
