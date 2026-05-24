'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function ExtensionLoginPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Listen for auth state — fires once PKCE code exchange completes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const { access_token, refresh_token, expires_at } = session;

        window.postMessage(
          {
            type: 'LEETREVISE_AUTH_SUCCESS',
            payload: { access_token, refresh_token, expires_at },
          },
          '*'
        );

        setStatus('success');
      }
    });

    const handleAuth = async () => {
      // Check if we already have a session (returning to this page post-redirect)
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        const { access_token, refresh_token, expires_at } = sessionData.session;

        window.postMessage(
          {
            type: 'LEETREVISE_AUTH_SUCCESS',
            payload: { access_token, refresh_token, expires_at },
          },
          '*'
        );

        setStatus('success');
        return;
      }

      // No session yet — kick off OAuth via the server login route (PKCE)
      // This redirects to /api/auth/login which sets PKCE cookies correctly
      window.location.href = '/api/auth/login?next=/auth/extension-login';
    };

    handleAuth();

    return () => subscription.unsubscribe();
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
        <p style={{ color: '#9ca3af', fontSize: '16px', marginTop: '12px' }}>
          Don&apos;t forget to{' '}
          <a href="/dashboard" style={{ color: '#f97316' }}>
            connect Google Calendar in the Dashboard
          </a>{' '}
          to enable revision reminders.
        </p>
      </div>
    </main>
  );
}
