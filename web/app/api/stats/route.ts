import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, createSupabaseServiceClient } from '@/lib/supabase-server';

function createCorsHeaders(origin?: string) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin');
  const corsHeaders = createCorsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const supabase = createSupabaseServiceClient();

    const { data: problems, error } = await supabase
      .from('scheduled_problems')
      .select('id, difficulty, topic_tags, is_solved, solved_at')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500, headers: corsHeaders });
    }

    const total = problems.length;
    const solved = problems.filter((p) => p.is_solved).length;
    const pending = total - solved;

    const byDifficulty: Record<string, { scheduled: number; solved: number }> = {
      Easy: { scheduled: 0, solved: 0 },
      Medium: { scheduled: 0, solved: 0 },
      Hard: { scheduled: 0, solved: 0 },
    };

    const byTopic: Record<string, { scheduled: number; solved: number }> = {};

    for (const p of problems) {
      if (p.difficulty && byDifficulty[p.difficulty]) {
        byDifficulty[p.difficulty].scheduled++;
        if (p.is_solved) byDifficulty[p.difficulty].solved++;
      }

      if (Array.isArray(p.topic_tags)) {
        for (const tag of p.topic_tags) {
          if (!byTopic[tag]) byTopic[tag] = { scheduled: 0, solved: 0 };
          byTopic[tag].scheduled++;
          if (p.is_solved) byTopic[tag].solved++;
        }
      }
    }

    const solvedDates = problems
      .filter((p) => p.is_solved && p.solved_at)
      .map((p) => new Date(p.solved_at as string).toISOString().split('T')[0])
      .sort();

    const uniqueDates = Array.from(new Set(solvedDates));
    let streak = 0;

    if (uniqueDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          total,
          solved,
          pending,
          by_difficulty: byDifficulty,
          by_topic: byTopic,
          current_streak: streak,
        },
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: createCorsHeaders('*'),
  });
}
