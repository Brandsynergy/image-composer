'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogIn, Loader2 } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'signIn' | 'signUp';
}

export function AuthDialog({ open, onOpenChange, defaultMode = 'signIn' }: AuthDialogProps) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setMessage('');
  };

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleSignUp = async () => {
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setMessage('Check your email for a confirmation link.');
    }
  };

  const handleSubmit = () => {
    if (mode === 'signIn') handleSignIn();
    else handleSignUp();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) { resetForm(); setMode(defaultMode); }
    }}>
      <DialogContent className="bg-[#0e0e10] border-white/10 text-white sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === 'signIn' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {message ? (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400">
              {message}
            </div>
          ) : (
            <>
              {mode === 'signUp' && (
                <div className="space-y-2">
                  <Label className="text-xs text-zinc-400">Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-400"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={loading || !email.trim() || !password.trim() || (mode === 'signUp' && !name.trim())}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {mode === 'signIn' ? 'Sign In' : 'Create Account'}
              </Button>
              <p className="text-center text-xs text-zinc-500">
                {mode === 'signIn' ? (
                  <>Don&apos;t have an account?{' '}
                    <button onClick={() => { setMode('signUp'); setError(''); }} className="text-violet-400 hover:underline">Sign Up</button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => { setMode('signIn'); setError(''); }} className="text-violet-400 hover:underline">Sign In</button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
