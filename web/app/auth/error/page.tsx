'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Parse hash fragment manually
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (!error) {
          router.push('/dashboard');
        } else {
          console.error('setSession error:', error);
          router.push('/?error=auth_failed');
        }
      });
    } else {
      // No token in hash — real error
      router.push('/?error=auth_failed');
    }
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