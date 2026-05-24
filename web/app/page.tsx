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
    <main className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">

        {/* Logo / Name */}
        <h1 className="text-3xl font-semibold text-white tracking-tight mb-3">
          LeetRevise
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          Schedule spaced repetition reminders for LeetCode problems you couldn't solve.
          Revisions at Day 3, 7, 15, and 30 — straight to your Google Calendar.
        </p>

        {/* Chrome Extension CTA */}
        <div className="mb-6 text-sm text-gray-500">
          <span>First, </span>
          <a
            href="https://chromewebstore.google.com/detail/leetrevisenew/kgolnkgiafaejbmdchkofgkpkdjhjbie"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-4 hover:text-gray-300 transition-colors"
          >
            install the Chrome extension
          </a>
          <span>, then connect your account below.</span>
        </div>

        {/* Login Button */}
        <a
          href="/api/auth/login"
          className="inline-block bg-white text-black font-medium text-sm px-6 py-2.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          Continue with Google
        </a>

        {/* Features — minimal, no cards */}
        <div className="mt-16 text-left space-y-5 border-t border-white/10 pt-10">
          {[
            { title: 'One-click scheduling', desc: 'A button appears on every LeetCode problem page. Click it to instantly schedule all revision dates.' },
            { title: 'Google Calendar sync', desc: 'Revision events are created in your calendar automatically with reminders.' },
            { title: 'Daily email digest', desc: 'Get an email at 9 AM UTC every day with all problems due for revision.' },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <span className="text-white/20 mt-0.5 text-sm select-none">—</span>
              <div>
                <p className="text-white text-sm font-medium">{f.title}</p>
                <p className="text-gray-500 text-sm mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-white/20 text-xs mt-16">
        <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</a>
        <span className="mx-2">·</span>
        <a href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</a>
        <span className="mx-2">·</span>
        <span>© 2026 LeetRevise</span>
      </footer>
    </main>
  );
}