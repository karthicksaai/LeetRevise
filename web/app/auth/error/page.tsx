'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Handle hash-based token (implicit flow)
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    // Also try getSession in case it's already set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white/40 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}