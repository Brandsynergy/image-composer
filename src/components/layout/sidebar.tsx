'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  UserPlus,
  Camera,
  Image,
  Coins,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/create', label: 'Model Creator', icon: UserPlus },
  { href: '/studio', label: 'Photo Studio', icon: Camera },
  { href: '/gallery', label: 'Gallery', icon: Image },
  { href: '/pricing', label: 'Pricing', icon: Coins },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signIn, signOut } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInName, setSignInName] = useState('');
  const [signInEmail, setSignInEmail] = useState('');

  const handleSignIn = () => {
    if (!signInName.trim() || !signInEmail.trim()) return;
    signIn({ name: signInName.trim(), email: signInEmail.trim() });
    setSignInName('');
    setSignInEmail('');
    setShowSignIn(false);
  };

  const handleSignOut = () => {
    signOut();
  };

  // User initials for avatar
  const initials = user
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/[0.06] bg-[#0a0a0b] transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-[240px]'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">IMAGE COMPOSER</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-violet-400">AI Studio</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] shrink-0 transition-colors',
                    isActive ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/[0.06] p-3 space-y-2">
          {user ? (
            /* Signed In */
            <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : 'px-2')}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-[11px] font-bold text-white">
                {initials}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                </div>
              )}
              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button onClick={handleSignOut} className="absolute" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-800">
                    Sign Out
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            /* Signed Out */
            <Button
              onClick={() => setShowSignIn(true)}
              variant="ghost"
              size="sm"
              className={cn(
                'w-full text-zinc-400 hover:text-white hover:bg-white/[0.04] gap-2',
                collapsed ? 'justify-center px-0' : ''
              )}
            >
              <LogIn className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign In</span>}
            </Button>
          )}

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-zinc-500 hover:text-white hover:bg-white/[0.04]"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Sign In Dialog */}
      <Dialog open={showSignIn} onOpenChange={setShowSignIn}>
        <DialogContent className="bg-[#0e0e10] border-white/10 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Sign In</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Name</Label>
              <Input
                value={signInName}
                onChange={(e) => setSignInName(e.target.value)}
                placeholder="Your name"
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Email</Label>
              <Input
                type="email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              />
            </div>
            <Button
              onClick={handleSignIn}
              disabled={!signInName.trim() || !signInEmail.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              <LogIn className="h-4 w-4" /> Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
