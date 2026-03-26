export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white/60 max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-white text-2xl font-semibold mb-8">Privacy Policy</h1>
      
      <p className="mb-4 text-sm">Last updated: March 2026</p>

      <h2 className="text-white text-lg font-medium mt-8 mb-3">What we collect</h2>
      <p className="text-sm mb-4">LeetRevise collects your Google account email and name for authentication. If you connect Google Calendar, we store an OAuth token to create calendar events on your behalf.</p>

      <h2 className="text-white text-lg font-medium mt-8 mb-3">How we use it</h2>
      <p className="text-sm mb-4">Your data is used solely to schedule LeetCode revision reminders. We create calendar events titled "Revise: [problem name]" on days 3, 7, 15, and 30 after you schedule a problem. We never sell or share your data.</p>

      <h2 className="text-white text-lg font-medium mt-8 mb-3">Google Calendar access</h2>
      <p className="text-sm mb-4">We request the <code className="text-orange-400">calendar.events</code> scope only to create revision reminder events. We do not read, modify, or delete any existing calendar events.</p>

      <h2 className="text-white text-lg font-medium mt-8 mb-3">Data deletion</h2>
      <p className="text-sm mb-4">You can disconnect Google Calendar at any time from your dashboard. To delete your account and all data, email <span className="text-orange-400">karthicksaai197@gmail.com</span>.</p>

      <h2 className="text-white text-lg font-medium mt-8 mb-3">Contact</h2>
      <p className="text-sm">karthicksaai197@gmail.com</p>
    </div>
  );
}