import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, createSupabaseServiceClient } from '@/lib/supabase-server';
import { createRevisionEvents, CalendarAuthError } from '@/lib/calendar';

const scheduleSchema = z.object({
  problem_title: z.string().min(1).max(500),
  problem_url: z.string().url(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topic_tags: z.array(z.string()).default([]),
});

const REVISION_INTERVALS = [3, 7, 15, 30];

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  };

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.flatten().fieldErrors }, { status: 400, headers: corsHeaders });
    }

    const { problem_title, problem_url, difficulty, topic_tags } = parsed.data;
    const supabase = createSupabaseServiceClient();

    const { data: existing } = await supabase
      .from('scheduled_problems')
      .select('id')
      .eq('user_id', user.id)
      .eq('problem_url', problem_url)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, problem_id: existing.id, already_exists: true }, { headers: corsHeaders });
    }

    const { data: problem, error: problemError } = await supabase
      .from('scheduled_problems')
      .insert({
        user_id: user.id,
        problem_title,
        problem_url,
        difficulty,
        topic_tags,
      })
      .select()
      .single();

    if (problemError || !problem) {
      return NextResponse.json({ success: false, error: 'Failed to save problem' }, { status: 500, headers: corsHeaders });
    }

    const today = new Date();
    const revisionRows = REVISION_INTERVALS.map((interval) => {
      const due = new Date(today);
      due.setDate(due.getDate() + interval);
      return {
        problem_id: problem.id,
        user_id: user.id,
        due_date: due.toISOString().split('T')[0],
        interval_day: interval,
      };
    });

    const { error: eventsError } = await supabase.from('revision_events').insert(revisionRows);
    if (eventsError) {
      await supabase.from('scheduled_problems').delete().eq('id', problem.id);
      return NextResponse.json({ success: false, error: 'Failed to create revision events' }, { status: 500, headers: corsHeaders });
    }

    let googleCalendarToken = null;
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('google_calendar_token')
        .eq('id', user.id)
        .single();
      googleCalendarToken = userData?.google_calendar_token ?? null;
    } catch {
      // user row may not exist yet, skip calendar sync
    }

    if (googleCalendarToken) {
      try {
        const calendarEventIds = await createRevisionEvents(googleCalendarToken, { title: problem_title, url: problem_url, difficulty });

        for (let i = 0; i < REVISION_INTERVALS.length; i++) {
          const interval = REVISION_INTERVALS[i];
          const eventId = calendarEventIds[i];
          await supabase
            .from('revision_events')
            .update({ google_calendar_event_id: eventId })
            .eq('problem_id', problem.id)
            .eq('interval_day', interval);
        }
      } catch (calErr) {
        if (calErr instanceof CalendarAuthError) {
          await supabase
            .from('users')
            .update({ google_calendar_token: null })
            .eq('id', user.id);
        }
      }
    }

    return NextResponse.json({ success: true, problem_id: problem.id }, { headers: corsHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
  }
}
