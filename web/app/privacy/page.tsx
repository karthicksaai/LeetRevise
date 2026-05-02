export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white/70 max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-white text-2xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-sm text-white/40 mb-10">Last updated: May 2026</p>

      <section className="mb-8">
        <h2 className="text-white text-lg font-medium mb-3">What we collect</h2>
        <p className="text-sm leading-relaxed">LeetRevise collects your Google account name and email address for authentication purposes only. If you connect Google Calendar, we store an OAuth refresh token to create calendar events on your behalf.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-white text-lg font-medium mb-3">How we use it</h2>
        <p className="text-sm leading-relaxed">Your data is used solely to schedule LeetCode revision reminders on days 3, 7, 15, and 30 after you mark a problem. We never sell, share, or use your data for advertising.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-white text-lg font-medium mb-3">Google Calendar access</h2>
        <p className="text-sm leading-relaxed">We request the <code className="text-orange-400 bg-white/5 px-1 rounded">calendar.events</code> scope only to create revision reminder events titled "Revise: [problem name]". We do not read, modify, or delete any of your existing calendar events.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-white text-lg font-medium mb-3">Data retention & deletion</h2>
        <p className="text-sm leading-relaxed">You can disconnect Google Calendar at any time from your dashboard settings. To permanently delete your account and all associated data, email us at <span className="text-orange-400">karthicksaai197@gmail.com</span> and we will process it within 7 days.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-white text-lg font-medium mb-3">Third-party services</h2>
        <p className="text-sm leading-relaxed">We use Supabase for database and authentication, Google OAuth for sign-in, and Resend for email delivery. Each service has its own privacy policy.</p>
      </section>

      <section>
        <h2 className="text-white text-lg font-medium mb-3">Contact</h2>
        <p className="text-sm">karthicksaai197@gmail.com</p>
      </section>
    </div>
  );
}