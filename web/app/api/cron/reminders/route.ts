import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { sendReminderDigest } from '@/lib/mailer';

interface RevisionEventRow {
  id: string;
  due_date: string;
  interval_day: number;
  user_id: string;
  scheduled_problems: {
    problem_title: string;
    problem_url: string;
    difficulty: string;
  };
  users: {
    email: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: dueEvents, error } = await supabase
      .from('revision_events')
      .select(`
        id,
        due_date,
        interval_day,
        user_id,
        scheduled_problems (
          problem_title,
          problem_url,
          difficulty
        ),
        users (
          email
        )
      `)
      .eq('due_date', today)
      .eq('is_completed', false)
      .eq('email_sent', false);

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to query events' }, { status: 500 });
    }

    const byUser: Record<string, { email: string; events: RevisionEventRow[] }> = {};

    for (const event of (dueEvents as unknown as RevisionEventRow[])) {
      const userId = event.user_id;
      if (!byUser[userId]) {
        byUser[userId] = { email: event.users.email, events: [] };
      }
      byUser[userId].events.push(event);
    }

    let sentCount = 0;

    for (const [, userData] of Object.entries(byUser)) {
      try {
        const problems = userData.events.map((e) => ({
          title: e.scheduled_problems.problem_title,
          url: e.scheduled_problems.problem_url,
          difficulty: e.scheduled_problems.difficulty,
          intervalDay: e.interval_day,
        }));

        await sendReminderDigest(userData.email, problems);

        const eventIds = userData.events.map((e) => e.id);
        await supabase
          .from('revision_events')
          .update({ email_sent: true })
          .in('id', eventIds);

        sentCount++;
      } catch {
        // Log failure but continue to next user
      }
    }

    return NextResponse.json({ success: true, sent: sentCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
