import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-12">

        {/* HERO — split layout, keep as-is */}
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:min-h-[78vh]">
          <div className="max-w-xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/65 mb-6">
              Chrome extension + Google Calendar
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl leading-[1.05]">
              Revise LeetCode problems before you forget them.
            </h1>

            <p className="mt-6 text-[17px] leading-8 text-[#b8b8b8] sm:text-[18px]">
              LeetRevise helps you schedule spaced repetition for problems you
              couldn&apos;t solve, then sends every revision directly to your Google Calendar.
            </p>

            <div className="mt-7 text-sm leading-7 text-[#989898]">
              First,
              <a
                href="https://chromewebstore.google.com/detail/leetrevisenew/kgolnkgiafaejbmdchkofgkpkdjhjbie"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-white underline underline-offset-4 hover:text-white/80 transition-colors"
              >
                install the Chrome extension
              </a>
              <span>, then connect your account.</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/api/auth/login?next=/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#ececec]"
              >
                Continue with Google
              </a>
              <a
                href="https://chromewebstore.google.com/detail/leetrevisenew/kgolnkgiafaejbmdchkofgkpkdjhjbie"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.02] px-6 py-3 text-sm font-medium text-white/88 transition-colors hover:bg-white/[0.05]"
              >
                Install extension
              </a>
            </div>
          </div>

          {/* Screenshot */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-white/[0.03] blur-3xl" />
            <div className="relative rounded-[28px] border border-white/10 bg-[#141414] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <img
                src="/extension-preview.png"
                alt="LeetRevise extension button on a LeetCode problem page"
                className="w-full rounded-[22px] border border-white/8"
              />
            </div>
          </div>
        </section>

        {/* FEATURES — no boxes, just text rows */}
        <section className="border-t border-white/8 pt-16 pb-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-white font-medium text-[15px]">One-click scheduling</p>
              <p className="mt-2 text-sm leading-7 text-[#8f8f8f]">
                A button appears on every LeetCode problem page. Click it to schedule Day 3, 7, 15, and 30 revisions instantly.
              </p>
            </div>

            <div>
              <p className="text-white font-medium text-[15px]">
                Google Calendar sync
                <span className="ml-2 text-[11px] font-medium text-white/45 uppercase tracking-[0.15em]">Key feature</span>
              </p>
              <p className="mt-2 text-sm leading-7 text-[#8f8f8f]">
                Every revision is added to your Google Calendar automatically, with reminders so you never miss a session.
              </p>
            </div>

            <div>
              <p className="text-white font-medium text-[15px]">Daily email digest</p>
              <p className="mt-2 text-sm leading-7 text-[#8f8f8f]">
                Get a morning summary of all problems due for revision that day — straight to your inbox.
              </p>
            </div>

            <div>
              <p className="text-white font-medium text-[15px]">Revision dashboard</p>
              <p className="mt-2 text-sm leading-7 text-[#8f8f8f]">
                Track pending problems, solved revisions, and your current streak in a simple dashboard.
              </p>
            </div>

          </div>
        </section>

        <footer className="pb-8 pt-4 text-center text-xs text-white/30">
          <a href="/privacy" className="transition-colors hover:text-white/55">Privacy Policy</a>
          <span className="mx-2">·</span>
          <a href="/terms" className="transition-colors hover:text-white/55">Terms of Service</a>
          <span className="mx-2">·</span>
          <span>© 2026 LeetRevise</span>
        </footer>

      </div>
    </main>
  );
}