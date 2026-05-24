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

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#151515] p-5">
                <p className="text-sm font-medium text-white">One-click scheduling</p>
                <p className="mt-2 text-sm leading-7 text-[#9f9f9f]">
                  Add Day 3, 7, 15, and 30 revisions straight from the LeetCode problem page.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Highlight</p>
                <p className="mt-2 text-sm font-medium text-white">Google Calendar sync</p>
                <p className="mt-2 text-sm leading-7 text-[#c8c8c8]">
                  Every revision is pushed into your calendar automatically, so reminders live where
                  you already plan your day.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-white/[0.03] blur-3xl" />
            <div className="relative rounded-[28px] border border-white/10 bg-[#141414] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <img
                src="/landing/extension-preview.png"
                alt="LeetRevise extension button on a LeetCode problem page"
                className="w-full rounded-[22px] border border-white/8"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-14">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#151515] p-6">
              <p className="text-white text-base font-semibold">Problem-first workflow</p>
              <p className="mt-2 text-sm leading-7 text-[#9c9c9c]">
                No separate planning tool. You schedule revisions exactly where you practice.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#151515] p-6">
              <p className="text-white text-base font-semibold">Daily email digest</p>
              <p className="mt-2 text-sm leading-7 text-[#9c9c9c]">
                Receive a daily summary of all problems due for revision so nothing slips.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#151515] p-6">
              <p className="text-white text-base font-semibold">Simple dashboard</p>
              <p className="mt-2 text-sm leading-7 text-[#9c9c9c]">
                Track pending problems, solved revisions, and your current revision streak.
              </p>
            </div>
          </div>
        </section>

        <footer className="pb-8 pt-2 text-center text-xs text-white/30">
          <a href="/privacy" className="transition-colors hover:text-white/55">
            Privacy Policy
          </a>
          <span className="mx-2">·</span>
          <a href="/terms" className="transition-colors hover:text-white/55">
            Terms of Service
          </a>
          <span className="mx-2">·</span>
          <span>© 2026 LeetRevise</span>
        </footer>
      </div>
    </main>
  );
}