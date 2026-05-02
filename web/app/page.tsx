import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-white mb-4">LeetRevise</h1>
        <p className="text-gray-400 text-xl mb-8">
          Never forget a LeetCode problem again. Schedule spaced repetition reminders directly from your browser.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/api/auth/login"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Get Started with Google
          </a>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            { title: 'One-Click Scheduling', desc: 'Stuck on a problem? Click the injected button to schedule Day 3, 7, 15, and 30 revisions instantly.' },
            { title: 'Google Calendar Sync', desc: 'Revision events are added to your Google Calendar automatically with popup reminders.' },
            { title: 'Daily Email Digest', desc: 'Receive a daily email at 8 AM listing all problems due for revision so nothing slips through.' },
          ].map((feature) => (
            <div key={feature.title} className="bg-[#1e1e2e] rounded-lg p-5">
              <h3 className="text-orange-400 font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <footer className="text-center py-6 text-white/30 text-xs mt-16">
        <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</a>
        <span className="mx-2">·</span>
        <span>© 2026 LeetRevise</span>
      </footer>
    </main>
  );
}
