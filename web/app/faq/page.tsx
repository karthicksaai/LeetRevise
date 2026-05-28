export const metadata = {
  title: 'FAQ — LeetRevise',
  description: 'Answers to common questions about LeetRevise.',
};

const faqs = [
  {
    q: 'Which Google account should I use to sign in to the website?',
    a: 'Sign in with the Google account that has the same email as your active LeetCode account. This is the account where your problems and revision data will be stored.',
  },
  {
    q: 'Which Google account should I use for Google Calendar sync?',
    a: 'Sign in with the Google account linked to your phone — the one where calendar notifications pop up as alerts. This way your revision reminders will show up on your phone automatically.',
  },
  {
    q: 'Which account should I install the Chrome extension on?',
    a: 'Install the extension in the browser profile where your LeetCode account is active. The extension detects the problem page and schedules revisions from there.',
  },
  {
    q: 'Can the website account and the calendar account be different?',
    a: "Yes, they can be different Google accounts. Just make sure the website account matches your LeetCode email, and the calendar account is the one that sends notifications to your phone.",
  },
  {
    q: 'When exactly do revision reminders show up in my calendar?',
    a: 'After you click "Can\'t Solve? Schedule Revision" on a LeetCode problem, revision events are created for Day 3, 7, 15, and 30 from that date. Each event includes a reminder so your phone notifies you.',
  },
  {
    q: 'What is the daily email digest?',
    a: 'Every day at 9 AM UTC, LeetRevise sends you an email listing all problems due for revision that day. It\'s a backup reminder in case you miss the calendar notification.',
  },
  {
    q: 'The extension button is not showing up on LeetCode. What do I do?',
    a: 'Make sure the extension is installed and enabled. Then open the extension popup and check that "Show button on LeetCode" is toggled on in the Settings tab. Also ensure you are signed in — go to Settings and connect your account if it shows "Not connected".',
  },
  {
    q: 'I marked a problem as solved. Will the remaining revisions still happen?',
    a: "Marking a revision as solved removes it from your pending list. The upcoming revision events already in your Google Calendar will stay there, but you won't receive new reminders for that revision cycle.",
  },
  {
    q: 'My calendar events are not showing up. What should I check?',
    a: 'Go to your dashboard and check if your Google Calendar is connected. If it shows as disconnected, reconnect it from the settings. Make sure you authorized calendar access during the sign-in flow.',
  },
  {
    q: 'Is LeetRevise free to use?',
    a: 'Yes, LeetRevise is completely free.',
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white px-6 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-[#9a9a9a] text-sm leading-7 mb-14">
          Still not sure?{' '}
          <a
            href="mailto:karthicksaai197@gmail.com"
            className="text-white underline underline-offset-4 hover:text-white/75 transition-colors"
          >
            Email us
          </a>{' '}
          or reach out on{' '}
          <a
            href="https://linkedin.com/in/karthicksaaikt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-4 hover:text-white/75 transition-colors"
          >
            LinkedIn
          </a>
          .
        </p>

        <div className="divide-y divide-white/8">
          {faqs.map((faq, i) => (
            <details key={i} className="group py-5 cursor-pointer list-none">
              <summary className="flex items-start justify-between gap-4 text-white font-medium text-[15px] leading-7 select-none list-none marker:hidden [&::-webkit-details-marker]:hidden">
                <span>{faq.q}</span>
                <span className="mt-1 shrink-0 text-white/40 transition-transform duration-200 group-open:rotate-45 text-lg leading-none">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-[#9a9a9a] pr-8">
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        <p className="mt-14 text-sm text-[#9a9a9a] leading-7">
          Still not finding what you need? Drop a mail to{' '}
          <a
            href="mailto:karthicksaai197@gmail.com"
            className="text-white underline underline-offset-4 hover:text-white/75 transition-colors"
          >
            karthicksaai197@gmail.com
          </a>{' '}
          or message on{' '}
          <a
            href="https://linkedin.com/in/karthicksaaikt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-4 hover:text-white/75 transition-colors"
          >
            linkedin.com/in/karthicksaaikt
          </a>
          .
        </p>
      </div>
    </main>
  );
}