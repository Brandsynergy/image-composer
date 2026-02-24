'use client';

import { useAppStore } from '@/lib/store';
import { CREDIT_PACKS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Coins, Sparkles, Check, X, ImageIcon, Zap, ShieldCheck,
} from 'lucide-react';
import type { CreditTier } from '@/types';

export default function Pricing() {
  const { settings, purchaseCredits } = useAppStore();
  const { credits, creditTier } = settings;

  const handlePurchase = (tier: CreditTier) => {
    // TODO: integrate payment provider (Stripe, etc.)
    // For now, credits are added directly on purchase
    purchaseCredits(tier);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Buy Image Credits</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Pay as you go. No subscriptions. No rollovers.
        </p>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border-violet-500/20">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Current Balance</p>
              <p className="text-2xl font-bold text-white">{credits} <span className="text-sm font-normal text-zinc-400">credits</span></p>
            </div>
          </div>
          {creditTier && (
            <Badge variant="secondary" className="bg-violet-600/20 text-violet-300 text-xs">
              {CREDIT_PACKS.find((p) => p.tier === creditTier)?.label} Plan
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CREDIT_PACKS.map((pack) => {
          const isActive = creditTier === pack.tier;
          const perCredit = (pack.price / pack.credits).toFixed(2);
          const isBestValue = pack.tier === 100;

          return (
            <Card
              key={pack.tier}
              className={`relative overflow-hidden transition-all ${
                isBestValue
                  ? 'bg-gradient-to-b from-violet-600/10 to-fuchsia-600/5 border-violet-500/30'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {isBestValue && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-fuchsia-600 to-violet-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                  Best Value
                </div>
              )}
              <CardContent className="p-6 space-y-5">
                {/* Tier Name */}
                <div>
                  <h3 className="text-lg font-bold text-white">{pack.label}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{pack.credits} image credits</p>
                </div>

                {/* Price */}
                <div>
                  <span className="text-3xl font-bold text-white">${pack.price.toFixed(2)}</span>
                  <span className="text-xs text-zinc-500 ml-1">one-time</span>
                  <p className="text-[10px] text-zinc-600 mt-1">${perCredit} per credit</p>
                </div>

                {/* Features */}
                <div className="space-y-2.5">
                  <Feature included label={`${pack.credits} image generations`} />
                  <Feature included label="All AI models & scenes" />
                  <Feature included label="All aspect ratios & exports" />
                  <Feature
                    included={pack.enhanceEnabled}
                    label="PRO Enhance (4K + Eye Fix)"
                    sublabel={pack.enhanceEnabled ? 'Uses 2 credits per image' : undefined}
                  />
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handlePurchase(pack.tier)}
                  className={`w-full gap-2 h-10 ${
                    isBestValue
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white'
                      : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  {isActive ? 'Buy Again' : 'Buy Credits'}
                </Button>

                {isActive && (
                  <p className="text-[10px] text-center text-violet-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Active plan
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <div className="text-center space-y-2">
        <p className="text-[11px] text-zinc-500">
          1 credit = 1 standard image generation. Enhanced images (PRO Enhance) use 2 credits.
        </p>
        <p className="text-[11px] text-zinc-600">
          Credits are non-refundable and do not roll over when purchasing a new pack.
        </p>
      </div>
    </div>
  );
}

function Feature({ included, label, sublabel }: { included: boolean; label: string; sublabel?: string }) {
  return (
    <div className="flex items-start gap-2">
      {included ? (
        <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
      ) : (
        <X className="h-3.5 w-3.5 text-zinc-600 mt-0.5 shrink-0" />
      )}
      <div>
        <span className={`text-xs ${included ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
        {sublabel && <span className="text-[9px] text-zinc-500 block">{sublabel}</span>}
      </div>
    </div>
  );
}
