import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest, createSupabaseServiceClient } from '@/lib/supabase-server';

const querySchema = z.object({
  status: z.enum(['pending', 'solved', 'all']).default('all'),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin');
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  };
  if (origin) corsHeaders['Access-Control-Allow-Origin'] = origin;

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') ?? 'all';
    const parsed = querySchema.safeParse({ status: statusParam });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400, headers: corsHeaders });
    }

    const { status } = parsed.data;
    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from('scheduled_problems')
      .select(`*, revision_events(id, due_date, interval_day, is_completed, completed_at, google_calendar_event_id, email_sent)`)
      .eq('user_id', user.id)
      .order('scheduled_at', { ascending: false });

    if (status === 'pending') query = query.eq('is_solved', false);
    else if (status === 'solved') query = query.eq('is_solved', true);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch problems' }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, data }, { headers: corsHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
