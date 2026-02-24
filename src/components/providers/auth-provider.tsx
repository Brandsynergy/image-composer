'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAppStore((s) => s.setUser);
  const grantFreeTrial = useAppStore((s) => s.grantFreeTrial);

  useEffect(() => {
    const supabase = createClient();

    // Sync initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name:
            session.user.user_metadata?.name ??
            session.user.email?.split('@')[0] ??
            '',
        });
      } else {
        setUser(null);
      }
    });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name:
            session.user.user_metadata?.name ??
            session.user.email?.split('@')[0] ??
            '',
        });
        // Grant 2 free credits on first sign-in
        if (event === 'SIGNED_IN') {
          grantFreeTrial();
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, grantFreeTrial]);

  return <>{children}</>;
}
