'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function CalendarBannerInner({ connected }: { connected: boolean }) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const cal = searchParams.get('calendar');
    if (cal) setStatus(cal);
  }, [searchParams]);

  const handleDisconnect = async () => {
    await fetch('/api/auth/calendar/disconnect', { method: 'POST' });
    window.location.reload();
  };

  if (status === 'connected') {
    return (
      <div className="max-w-3xl mx-auto px-5 pt-6">
        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-sm">📅 Google Calendar connected</span>
            <span className="text-white/30 text-xs">Revision events will be added automatically</span>
          </div>
          <a href="/dashboard" className="text-white/30 text-xs hover:text-white/60">dismiss</a>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-3xl mx-auto px-5 pt-6">
        <div className="py-3 px-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <span className="text-red-400 text-sm">Calendar connection failed. Please try again.</span>
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="max-w-3xl mx-auto px-5 pt-6">
        <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span className="text-white/40 text-xs">Google Calendar syncing</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-white/20 text-xs hover:text-red-400 transition-colors"
          >
            disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '24px 20px 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Connect Google Calendar
          </span>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '2px' }}>
            Auto-add revision reminders to your calendar
          </p>
        </div>
        <a
          href="/api/auth/calendar"
          style={{
            fontSize: '12px',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.6)',
            padding: '6px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          Connect →
        </a>
      </div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js 13+
export default function CalendarBanner({ connected }: { connected: boolean }) {
  return (
    <Suspense fallback={null}>
      <CalendarBannerInner connected={connected} />
    </Suspense>
  );
}