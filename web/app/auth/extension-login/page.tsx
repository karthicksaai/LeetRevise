'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function ExtensionLoginPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const handleAuth = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/extension-login`,
            scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events',
          },
        });

        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
        }
        return;
      }

      const { access_token, refresh_token, expires_at } = sessionData.session;

      window.postMessage(
        {
          type: 'LEETREVISE_AUTH_SUCCESS',
          payload: { access_token, refresh_token, expires_at },
        },
        '*'
      );

      setStatus('success');
    };

    handleAuth();
  }, []);

  if (status === 'loading') {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f1a', color: '#ffffff', fontFamily: 'sans-serif' }}>
        <p>Connecting your account...</p>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f1a', color: '#ef4743', fontFamily: 'sans-serif' }}>
        <p>Error: {errorMessage}</p>
      </main>
    );
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f0f1a', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#f97316', fontSize: '32px', marginBottom: '16px' }}>Account Connected</h1>
        <p style={{ color: '#9ca3af', fontSize: '16px' }}>You can close this tab and return to the extension.</p>
      </div>
    </main>
  );
}
