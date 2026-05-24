import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ProblemReminder {
  title: string;
  url: string;
  difficulty: string;
  intervalDay: number;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return '#00b8a3';
    case 'Medium':
      return '#ffc01e';
    case 'Hard':
      return '#ef4743';
    default:
      return '#6b7280';
  }
}

function buildEmailHtml(problems: ProblemReminder[], appUrl: string): string {
  const problemCards = problems
    .map(
      (p) => `
      <div style="background:#1e1e2e;border-radius:8px;padding:16px;margin-bottom:12px;border-left:4px solid ${getDifficultyColor(p.difficulty)};">
        <a href="${p.url}" style="color:#f97316;font-weight:600;font-size:15px;text-decoration:none;">${p.title}</a>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
          <span style="background:${getDifficultyColor(p.difficulty)};color:#000;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">${p.difficulty}</span>
          <span style="color:#6b7280;font-size:12px;">Day ${p.intervalDay} revision</span>
        </div>
      </div>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;">
      <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#f97316;font-size:24px;margin:0;">LeetRevise</h1>
          <p style="color:#6b7280;margin:8px 0 0;">Spaced repetition for LeetCode</p>
        </div>

        <div style="background:#161625;border-radius:12px;padding:24px;">
          <h2 style="color:#ffffff;font-size:18px;margin:0 0 8px;">You have ${problems.length} problem${problems.length !== 1 ? 's' : ''} to revisit today</h2>
          <p style="color:#9ca3af;font-size:14px;margin:0 0 24px;">Keep your streak alive. Each of these was scheduled based on spaced repetition intervals.</p>
          ${problemCards}
        </div>

        <div style="text-align:center;margin-top:24px;">
          <a href="${appUrl}/dashboard" style="background:#f97316;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open Dashboard</a>
        </div>

        <div style="text-align:center;margin-top:32px;color:#4b5563;font-size:12px;">
          <p>You are receiving this because you scheduled revisions on LeetRevise.</p>
          <p><a href="${appUrl}/settings?unsubscribe=1" style="color:#6b7280;">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>`;
}

export async function sendReminderDigest(
  userEmail: string,
  problems: ProblemReminder[]
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://leetrevise.app';

  const { error } = await resend.emails.send({
    from: 'LeetRevise <onboarding@resend.dev>',
    to: userEmail,
    subject: `LeetRevise: You have ${problems.length} problem${problems.length !== 1 ? 's' : ''} to revisit today`,
    html: buildEmailHtml(problems, appUrl),
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }
}
